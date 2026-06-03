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


```bash
sudo chmod 777 /mnt/slow-storage
```

## Step 7: Verify Setup

This should be much slower than writing to other directories.

```bash
time dd if=/dev/zero of=/mnt/slow-storage/testfile bs=1M count=1000
```

Another way to test:
```bash
fio --name=slow-test --filename=/mnt/slow-storage/testfile --size=1G --numjobs=1 --rw=randrw --direct=1
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
