pub trait WAL {
    fn append(&mut self, block: String) -> ();
    fn read(&self, index: usize) -> String;
}

pub mod in_memory_wal;