# Simulating Disk Latency with Loopback Devices and dm-delay

## Step 1: Create Empty File for the Loopback Device

```bash
fallocate --length 5G /tmp/slow-disk.img
```

## Step 2: Set Up Loopback Devices

See if you already have any set up:

```bash
sudo losetup -all
```

Create the loop back device

```bash
sudo losetup /dev/loop0 /tmp/slow-disk.img
```

## Step 3: Set Up Device Mapper Delay

### 3.1 Get device information

First, get the device size in sectors:

```bash
sudo blockdev --getsz /dev/loop0
```

### 3.2 Create the Delay

```bash
echo "0 10485760 delay /dev/loop0 0 100" | sudo dmsetup create slow-io-delay
```

(yes the echo is necessary, how wild is this CLI)

- First 0: starting sector offset
- 10485760: number of sectors (from the blockdev command above)
- Second 0: Offset within the physical device where mapping begins
- 100: how many ms to delay reads and writes
    - You can set up different delays for reads vs writes if desired by repeating the `/dev/loop0 0 100` again with a number different than 100

This will create a directory: `/dev/mapper/slow-io-delay`

## Step 4: Create Filesystems

```bash
sudo mkfs.ext4 /dev/mapper/slow-io-delay
```


## Step 5: Mount the Filesystem

```bash
sudo mkdir --parent /mnt/slow-storage
```

- `--parent`: Create parent directories as needed

```bash
sudo mount /dev/mapper/slow-io-delay /mnt/slow-storage
```

Verify:
```bash
mount | grep /mnt/slow-storage
```

## Step 6: Allow Anyone To Write


Allow your user to write to these directories without `sudo`:

```bash
sudo chmod 777 /mnt/slow-storage
```

## Step 7: Verify Setup

This should be much slower than writing to other directories.

```bash
time dd if=/dev/zero of=/mnt/slow-storage/testfile bs=1M count=1000
```

## Cleanup

When done, unmount and clean up:

```bash
sudo umount /mnt/slow-storage

sudo dmsetup remove slow-io-delay

sudo losetup -d /dev/loop0

sudo rmdir /mnt/slow-storage

rm /tmp/slow-disk.img
```
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
