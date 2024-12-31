import redis
import json
import logging
from typing import Any, Optional
from datetime import timedelta

class CacheService:
    def __init__(self, config):
        self.config = config
        self.redis = self._connect()
        self.default_ttl = config.get('CACHE_TTL', 3600)  # 1 hour default

    def _connect(self) -> redis.Redis:
        try:
            client = redis.Redis(
                host=self.config['REDIS_HOST'],
                port=self.config['REDIS_PORT'],
                password=self.config.get('REDIS_PASSWORD'),
                db=self.config.get('REDIS_DB', 0),
                decode_responses=True
            )
            client.ping()
            logging.info("Connected to Redis successfully")
            return client
        except redis.ConnectionError as e:
            logging.error(f"Redis connection failed: {str(e)}")
            raise

    def get(self, key: str) -> Optional[Any]:
        try:
            data = self.redis.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            logging.error(f"Cache get failed: {str(e)}")
            return None

    def set(self, key: str, value: Any, ttl: int = None) -> bool:
        try:
            serialized = json.dumps(value)
            return self.redis.set(
                key,
                serialized,
                ex=ttl or self.default_ttl
            )
        except Exception as e:
            logging.error(f"Cache set failed: {str(e)}")
            return False

    def delete(self, key: str) -> bool:
        try:
            return bool(self.redis.delete(key))
        except Exception as e:
            logging.error(f"Cache delete failed: {str(e)}")
            return False

    def exists(self, key: str) -> bool:
        try:
            return bool(self.redis.exists(key))
        except Exception as e:
            logging.error(f"Cache exists check failed: {str(e)}")
            return False

    def clear(self, pattern: str = None) -> bool:
        try:
            if pattern:
                keys = self.redis.keys(pattern)
                if keys:
                    return bool(self.redis.delete(*keys))
                return True
            return bool(self.redis.flushdb())
        except Exception as e:
            logging.error(f"Cache clear failed: {str(e)}")
            return False

    def increment(self, key: str, amount: int = 1) -> Optional[int]:
        try:
            return self.redis.incrby(key, amount)
        except Exception as e:
            logging.error(f"Cache increment failed: {str(e)}")
            return None

    def decrement(self, key: str, amount: int = 1) -> Optional[int]:
        try:
            return self.redis.decrby(key, amount)
        except Exception as e:
            logging.error(f"Cache decrement failed: {str(e)}")
            return None

    def set_many(self, mapping: dict, ttl: int = None) -> bool:
        try:
            pipeline = self.redis.pipeline()
            for key, value in mapping.items():
                pipeline.set(key, json.dumps(value), ex=ttl or self.default_ttl)
            pipeline.execute()
            return True
        except Exception as e:
            logging.error(f"Cache set_many failed: {str(e)}")
            return False

    def get_many(self, keys: list) -> dict:
        try:
            pipeline = self.redis.pipeline()
            for key in keys:
                pipeline.get(key)
            values = pipeline.execute()
            return {
                key: json.loads(value) if value else None
                for key, value in zip(keys, values)
            }
        except Exception as e:
            logging.error(f"Cache get_many failed: {str(e)}")
            return {}

    def close(self):
        try:
            self.redis.close()
        except Exception as e:
            logging.error(f"Redis connection close failed: {str(e)}")
