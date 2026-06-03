# Simulating Disk Latency with Loopback Devices and dm-delay

This guide provides step-by-step instructions for creating loopback devices and using device-mapper delay to simulate different disk performance characteristics. You'll end up with two folder paths: one with fast I/O and another with slow I/O for testing and benchmarking.

## Prerequisites

- Linux system (this guide uses Ubuntu/Debian commands)
- `sudo` or root access
- The following packages: `util-linux`, `device-mapper`
- At least 10GB of free disk space for the loopback files

## Installation

```bash
sudo apt-get update
sudo apt-get install -y util-linux device-mapper
```

## Step 1: Create Loopback Files

Loopback devices allow you to treat files as block devices. We'll create two files: one for fast storage and one for slow storage.

### 1.1 Create the fast storage file

```bash
fallocate -l 5G /tmp/fast-disk.img
```

**Argument explanation:**
- `fallocate`: Command to pre-allocate space for files
- `-l`: (length flag) Specifies the size of the file to allocate
- `5G`: Size of the file (5 Gigabytes). Adjust this based on your available disk space

### 1.2 Create the slow storage file

```bash
fallocate -l 5G /tmp/slow-disk.img
```

**Argument explanation:**
- Same as above, creating another 5GB file for the slow storage simulation

## Step 2: Set Up Loopback Devices

Create loopback devices that point to these files.

### 2.1 Create loopback device for fast storage

```bash
sudo losetup /dev/loop0 /tmp/fast-disk.img
```

**Argument explanation:**
- `losetup`: Utility to associate loop devices with files
- `/dev/loop0`: The loop device to create (first available loop device)
- `/tmp/fast-disk.img`: Path to the backing file created in Step 1

### 2.2 Create loopback device for slow storage

```bash
sudo losetup /dev/loop1 /tmp/slow-disk.img
```

**Argument explanation:**
- `/dev/loop1`: The second loop device (increment the number for each device)
- `/tmp/slow-disk.img`: Path to the backing file

### 2.3 Verify loopback devices

```bash
sudo losetup -a
```

**Argument explanation:**
- `-a`: (all flag) Lists all currently used loopback devices

You should see output like:
```
/dev/loop0: [0801]:1234567 (/tmp/fast-disk.img)
/dev/loop1: [0801]:1234568 (/tmp/slow-disk.img)
```

## Step 3: Create Filesystems

Format the loopback devices with a filesystem so they can store files.

### 3.1 Format fast storage with ext4

```bash
sudo mkfs.ext4 /dev/loop0
```

**Argument explanation:**
- `mkfs.ext4`: Make filesystem with ext4 format
- `/dev/loop0`: The device to format

### 3.2 Format slow storage with ext4

```bash
sudo mkfs.ext4 /dev/loop1
```

**Argument explanation:**
- Same as above for the second device

## Step 4: Create Mount Points

Create directories where these devices will be accessible.

```bash
sudo mkdir -p /mnt/fast-storage /mnt/slow-storage
```

**Argument explanation:**
- `mkdir`: Make directory
- `-p`: (parents flag) Create parent directories as needed
- `/mnt/fast-storage`: Mount point for fast storage
- `/mnt/slow-storage`: Mount point for slow storage

## Step 5: Mount the Loopback Devices

```bash
sudo mount /dev/loop0 /mnt/fast-storage
sudo mount /dev/loop1 /mnt/slow-storage
```

**Argument explanation:**
- `mount`: Attach a filesystem to the directory tree
- `/dev/loop0`: Device to mount
- `/mnt/fast-storage`: Directory where device will be mounted

Verify with:
```bash
mount | grep /mnt/
```

## Step 6: Set Up Device-Mapper Delay

Device-mapper is used to create logical volumes with delay filters. We'll create a delayed version of the slow-storage device.

### 6.1 Get device information

First, get the device size in sectors:

```bash
sudo blockdev --getsz /dev/loop1
```

**Argument explanation:**
- `blockdev`: Utility to get/set block device information
- `--getsz`: (get size) Gets device size in 512-byte sectors
- `/dev/loop1`: The device to query

This will output a number (e.g., `10485760` for 5GB). Save this value; we'll use it as `{SECTORS}` in the next steps.

### 6.2 Calculate sectors for dm-delay

```bash
echo "5G = 5 * 1024 * 1024 * 1024 / 512 = 10485760 sectors"
```

For your 5GB file, this is 10485760 sectors. For different sizes, adjust accordingly.

### 6.3 Unmount the loop device before creating device-mapper table

We need to unmount /dev/loop1 first to allow device-mapper to take control:

```bash
sudo umount /mnt/slow-storage
```

**Argument explanation:**
- `umount`: Detach filesystem from mount point
- `/mnt/slow-storage`: The mount point to detach

### 6.4 Create device-mapper table for delayed I/O

```bash
echo "0 10485760 delay /dev/loop1 0 0 5 5" | sudo dmsetup create slow-io-delay
```

**Argument explanation:**
- `echo`: Outputs the string that defines the device-mapper configuration
- `|`: Pipe operator sends the output to dmsetup
- `dmsetup create`: Creates a new device-mapper device
- `slow-io-delay`: Name of the new logical volume to create
- `0`: Starting sector offset (always 0)
- `10485760`: Number of sectors to map (device size; use output from `blockdev --getsz`)
- `delay`: The device-mapper target type (creates artificial I/O delays)
- `/dev/loop1`: The physical device to map
- `0`: Offset within the physical device where mapping begins (0 = from start)
- `0`: Number of milliseconds to delay READ operations (0 = no delay; set to higher number for slow reads)
- `5`: Number of milliseconds to delay WRITE operations (5ms = slight delay for writes)
- `5`: Third delay parameter (implementation specific; typically same as write delay)

### 6.5 Alternative: Create highly delayed version (100ms latency)

For a more dramatic slow storage effect:

```bash
echo "0 10485760 delay /dev/loop1 0 100 100 100" | sudo dmsetup create slow-io-delay
```

**Argument explanation:**
- `100` (first instance after /dev/loop1 offset): Milliseconds to delay READ operations (100ms = noticeable latency)
- `100` (second instance): Milliseconds to delay WRITE operations (100ms = noticeable latency)
- `100` (third instance): Third delay parameter for consistency

This creates 100ms latency on all I/O operations, making the difference very apparent in benchmarks.

## Step 7: Create Filesystem on Delayed Device

```bash
sudo mkfs.ext4 /dev/mapper/slow-io-delay
```

**Argument explanation:**
- `mkfs.ext4`: Make filesystem with ext4 format
- `/dev/mapper/slow-io-delay`: The device-mapper virtual device created in Step 6.4

## Step 8: Mount the Delayed Device

```bash
sudo mount /dev/mapper/slow-io-delay /mnt/slow-storage
```

**Argument explanation:**
- `mount`: Attach a filesystem to the directory tree
- `/dev/mapper/slow-io-delay`: The delayed I/O device with artificial latency
- `/mnt/slow-storage`: Mount point where the delayed device appears

Verify both are mounted:
```bash
mount | grep /mnt/
```

## Step 9: Set Permissions (Optional but Recommended)

Allow your user to write to these directories without `sudo`:

```bash
sudo chown -R $(whoami):$(whoami) /mnt/fast-storage /mnt/slow-storage
sudo chmod -R 755 /mnt/fast-storage /mnt/slow-storage
```

**Argument explanation:**
- `chown`: Change owner
- `-R`: (recursive flag) Apply to all files and subdirectories
- `$(whoami)`: Substitutes your current username (e.g., `nick`)
- `:`: Separator between user and group owner
- `chmod`: Change mode (permissions)
- `755`: Read/write/execute for owner (7); read/execute for group (5); read/execute for others (5)

## Step 10: Verify Setup

Test the setup by creating files on both paths:

```bash
# Write to fast storage
time dd if=/dev/zero of=/mnt/fast-storage/testfile bs=1M count=100
time dd if=/dev/zero of=/mnt/slow-storage/testfile bs=1M count=100
```

**Argument explanation:**
- `time`: Measure execution time of the following command
- `dd`: Convert and copy data (low-level copying utility)
- `if=/dev/zero`: Input file (/dev/zero provides infinite null bytes)
- `of=`: Output file path (where data will be written)
- `bs=1M`: Block size (1 Megabyte per block - affects I/O chunk size)
- `count=100`: Number of blocks to copy (100 × 1MB = 100MB total)

The slow storage should take noticeably longer due to the delays per I/O operation.

## Advanced: Creating Multiple Delayed Devices with Different Latencies

You can create multiple device-mapper devices with different delays:

```bash
# Create 50ms delay device
echo "0 10485760 delay /dev/loop1 0 50 50 50" | sudo dmsetup create slow-io-delay-50

# Create 200ms delay device
echo "0 10485760 delay /dev/loop1 0 200 200 200" | sudo dmsetup create slow-io-delay-200
```

Then mount each:
```bash
sudo mkfs.ext4 /dev/mapper/slow-io-delay-50
sudo mkfs.ext4 /dev/mapper/slow-io-delay-200
sudo mount /dev/mapper/slow-io-delay-50 /mnt/slow-storage-50
sudo mount /dev/mapper/slow-io-delay-200 /mnt/slow-storage-200
```

## Cleanup

When done, unmount and clean up:

```bash
# Unmount filesystems
sudo umount /mnt/fast-storage /mnt/slow-storage

# Remove device-mapper table
sudo dmsetup remove slow-io-delay

# Detach loopback devices
sudo losetup -d /dev/loop0 /dev/loop1

# Remove mount directories
sudo rmdir /mnt/fast-storage /mnt/slow-storage

# Optional: Remove backing files
rm /tmp/fast-disk.img /tmp/slow-disk.img
```

**Argument explanation:**
- `umount`: Unmount filesystems from mount points
- `dmsetup remove`: Remove device-mapper logical volume by name
- `losetup -d`: (detach flag) Detaches loop device associations with backing files
- `rmdir`: Remove empty directories (will fail if directory not empty)
- `rm`: Remove files permanently

If cleaning up multiple delayed devices:
```bash
sudo dmsetup remove slow-io-delay-50
sudo dmsetup remove slow-io-delay-200
sudo umount /mnt/slow-storage-50 /mnt/slow-storage-200
```

## Troubleshooting

### "Device or resource busy" error
The device is still mounted or in use. Ensure all processes using it are closed and unmount first:
```bash
lsof | grep /mnt/slow-storage  # Find processes using the mount
sudo umount /mnt/slow-storage
```

### "No loop devices available"
Find the next available loop device:
```bash
sudo losetup -f
```

### Cannot write to mount points without sudo
Run the permission commands from Step 9 again.

### Device-mapper not working
Ensure device-mapper is loaded:
```bash
sudo modprobe dm_delay
```

**Argument explanation:**
- `modprobe`: Load kernel module
- `dm_delay`: The device-mapper delay module name

## Performance Testing

Compare performance with a simple benchmark:

```bash
# Fast storage benchmark
fio --name=fast-test --filename=/mnt/fast-storage/testfile --size=1G --numjobs=4 --rw=randrw --direct=1

# Slow storage benchmark
fio --name=slow-test --filename=/mnt/slow-storage/testfile --size=1G --numjobs=4 --rw=randrw --direct=1
```

**Argument explanation:**
- `fio`: Flexible I/O tester (benchmark tool)
- `--name=`: Name/label for the benchmark test (for output identification)
- `--filename=`: File path to perform I/O operations on
- `--size=1G`: Total amount of data to operate on (1 Gigabyte)
- `--numjobs=4`: Number of parallel worker threads/jobs
- `--rw=randrw`: Random read/write workload (alternates between reads and writes)
- `--direct=1`: Bypass operating system page cache (1 = enabled; 0 = disabled)

This will show clear latency differences between fast and slow storage paths. The slow storage will show significantly higher latencies and lower IOPS (I/O Operations Per Second).

## Summary

You now have:
- `/mnt/fast-storage`: Direct loopback device with minimal latency (fast path)
- `/mnt/slow-storage`: Device-mapper delayed device with configurable latency (slow path)

Use these paths to test application behavior under different I/O performance conditions.
