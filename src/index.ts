import joplin from 'api';
import {ToastType, ToolbarButtonLocation} from 'api/types';

joplin.plugins.register({
    onStart: async function () {
        await joplin.commands.register({
            name: 'validateHugo',
            label: 'Validate Hugo Content',
            iconName: 'fas fa-clipboard-check',
            execute: async () => {

                function extractJsonFromTop(fileContent: string): string | null {
                    const standaloneJsonRegex = /^(\{[\s\S]+?})(?=\n\n|$)/;
                    const standaloneMatch = fileContent.match(standaloneJsonRegex);
                    if (standaloneMatch) {
                        return standaloneMatch[1].trim();
                    }
                    return null;
                }

                function isValidJson(str: string): boolean {
                    try {
                        JSON.parse(str);
                        return true;
                    } catch (e) {
                        return false;
                    }
                }

                const note = await joplin.workspace.selectedNote();
                if (!note) return;

                const body = note.body;
                const errors = [];

                // Success State: Valid Front Matter block at the beginning
                const yamlFrontMatterRegex = /^-{3}\n(?:[a-zA-Z\s]+: ?(?:"?[\w,.'\-+*()@#$%^:\s!?&_]+"?|[\d\-T:+]+|\[]| |(?:\s+- [a-z ]+)+|true|false|null|)\n)+(?:-{3}|\.{3})/gm;
                const tomlFrontMatterRegex = /^\+{3}\n(?:[a-zA-Z\s]+ = (?:[\d\-T:]+|false|'.*')\n|^\[.*]$)+\+{3}/gm;

                if (body.startsWith('---')) {
                    if (!yamlFrontMatterRegex.test(body)) {
                        errors.push('Invalid YAML front matter format.');
                    }
                } else if (body.startsWith('+++')) {
                    if (!tomlFrontMatterRegex.test(body)) {
                        errors.push('Invalid TOML front matter format.');
                    }
                } else if (body.startsWith('{')) {
                    const jsonContent = extractJsonFromTop(body);
                    if (!jsonContent || !isValidJson(jsonContent)) {
                        errors.push('Invalid JSON front matter format.');
                    }
                } else {
                    errors.push('No valid front matter block (YAML, TOML, or JSON) found at the beginning of the note.');
                }

                // Failure State 1: No H1 headers allowed
                const h1Regex = /^(?!```)(?![^`]*```)(# .*)/m;
                if (h1Regex.test(body)) {
                    errors.push('H1 headers are not allowed. Use H2 or greater.');
                }

                // Failure State 2: Only headers up to H6 are allowed
                const h7Regex = /^#{7,}/m;
                if (h7Regex.test(body)) {
                    errors.push('Only headers up to H6 are allowed.');
                }

                // Failure State 3: Two newlines between a header and content
                const headerNewlineRegex = /^(?!```)(?![^`]*```)#+ .+\n.+/m;
                if (headerNewlineRegex.test(body)) {
                    errors.push('Each header must be followed by two newlines (one blank line) before content.');
                }

                // Failure State 4: Images must have alt text
                const imageAltRegex = /!\[]\(.*\)/;
                if (imageAltRegex.test(body)) {
                    errors.push('All images must have alt text.');
                }

                if (errors.length > 0) {
                    await joplin.views.dialogs.showMessageBox(
                        'Validation Errors:\n\n' + errors.map(e => '- ' + e).join('\n')
                    );
                } else {
                    await joplin.views.dialogs.showToast({
                        message: 'Validation successful! Note is Hugo-compatible.',
                        type: ToastType.Success,
                    });
                }
            },
        });

        await joplin.views.toolbarButtons.create(
            'validateHugoBtn',
            'validateHugo',
            ToolbarButtonLocation.EditorToolbar
        );
    },
});
