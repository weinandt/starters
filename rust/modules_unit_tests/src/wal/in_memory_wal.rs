use crate::wal::WAL;

pub struct InMemoryWAL {
    // TODO: who should allocate this?
    blocks: Vec<String>,
}

impl InMemoryWAL {
    pub fn new() -> InMemoryWAL {
        InMemoryWAL {
            blocks: Vec::new(),
        }
    }
}

impl WAL for InMemoryWAL {
    fn append(&mut self, block: String) -> (){
        self.blocks.push(block.clone());
    }
    fn read(&self, index: usize) -> String {
        self.blocks[index].clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

     #[test]
    fn test_value_present_after_writing() {
        let expected = "Hello, world!";
        let mut in_mem_wal = InMemoryWAL::new();
        in_mem_wal.append(expected.to_string());

        
        assert_eq!(in_mem_wal.blocks[0], expected);
    }
}