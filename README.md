#  Joplin Hugo Validator

After finding [this blog post from Jack Adler](https://jalder.dev/posts/joplin-to-hugo/) about maintaining his Hugo blog from inside Joplin, I knew that I wanted to give it a try. However, I was concerned about pushing malformed content to Hugo without a way to easily get responses back about the success or failure of builds. I frequently use lots of formatting in my own posts, so it was important to make sure that the content I'm sending to Hugo is as valid as I can make it without having access to the Hugo binary.

## Usage

The validator adds a button to your edit pane that runs the following checks:

- valid YAML / JSON / TOML front matter
- no H1 headings
- no headings greater than 6
- two newlines between header and content
- images must have alt text

![An example of a failing check](assets/example.png)

If no issues are found, a quick toast message is shown:

![An example of no issues](assets/success.png)
