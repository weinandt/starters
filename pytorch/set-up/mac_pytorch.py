import torch
import time

# 1. Verify MPS (Metal Performance Shaders) is available
if torch.backends.mps.is_available():
    device = torch.device("mps")
    print("MPS backend found. Using Apple Silicon GPU.")
else:
    print("MPS backend not found. Falling back to CPU.")
    device = torch.device("cpu")

# 2. Create large tensors to give the GPU actual work to do
size = 10000
print(f"Creating two {size}x{size} matrices...")
matrix_a = torch.rand(size, size, device=device)
matrix_b = torch.rand(size, size, device=device)

print("Multiplying matrices (this should spike your GPU usage)...")
start_time = time.time()

# Run in a loop to keep the GPU busy for a few seconds
for i in range(20):
    result = torch.matmul(matrix_a, matrix_b)

# Ensure the operations finish before stopping the clock
if device.type == 'mps':
    torch.mps.synchronize()

end_time = time.time()
print(f"Computation complete in {end_time - start_time:.2f} seconds!")