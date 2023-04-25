# Shapez 2 Blueprint Bot
A rudimentary bot meant to bring https://github.com/jmeggitt/shapez2_blueprint_renderer/ to discord.

Requires NodeJS and Rust.

What I used when creating this: 
Node: [v16.14.2](https://nodejs.org/download/release/v16.14.2/)
Rust: [v1.68.2](https://blog.rust-lang.org/2023/04/20/Rust-1.69.0.html)

## How to setup.

1. Create `./.env` file with contents `TOKEN=PASTETOKEN`
2. Create `./models` folder with all .obj
3. Create `./stringToImageDocker` with the [rust project](https://github.com/jmeggitt/shapez2_blueprint_renderer/)
4. Run `cargo build --release` in `./stringToImageDocker`
5. Change `./config.json` to your paths.
6. Run `npm i` in the root

