# Modules And Unit Tests

Examples of a trait and how implementations of a trait reside in a folder.

Unit tests in rust live next to the code. Integration tests do not.

## Rust Integration Tests
These are not yet implemented in the project. Rust seems to recommend all functionality live in a `lib.rs` file.
Even for http servers, so the integration tests can import that `lib.rs` file: https://doc.rust-lang.org/book/ch11-03-test-organization.html#integration-tests-for-binary-crates

## To Run Tests
`cargo test`