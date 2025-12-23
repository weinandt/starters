mod wal;

use crate::wal::WAL;
use crate::wal::in_memory_wal::InMemoryWAL;

fn main() {
    let mut in_mem_wal = InMemoryWAL::new();
    in_mem_wal.append("hi".to_string());
    in_mem_wal.append("yup".to_string());
    println!("Storage at block 0: {}", in_mem_wal.read(0));
    println!("Storage at block 1: {}", in_mem_wal.read(1));
}