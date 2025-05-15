# Kafka In Docker

To run: `docker-compose up`

## Config Explations
- KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: Necessary for consumer groups to work when only running a single broker
- EXTERNAL: Could be called anything, but needed to have a different network, so processes running outside of docker can call kafka.