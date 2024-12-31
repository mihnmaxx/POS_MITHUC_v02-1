from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, OperationFailure
from bson import ObjectId
from typing import Dict, List, Any
import logging

class DatabaseService:
    def __init__(self, config):
        self.config = config
        self.client = self._connect()
        self.db = self.client[config['database']]
        
    def _connect(self) -> MongoClient:
        try:
            client = MongoClient(
                host=self.config['host'],
                port=self.config['port'],
                username=self.config.get('username'),
                password=self.config.get('password'),
                serverSelectionTimeoutMS=5000
            )
            client.admin.command('ping')
            logging.info("Connected to MongoDB successfully")
            return client
        except ConnectionFailure:
            logging.error("Failed to connect to MongoDB")
            raise

    def find_one(self, collection: str, query: Dict) -> Dict:
        try:
            return self.db[collection].find_one(query)
        except OperationFailure as e:
            logging.error(f"Database operation failed: {str(e)}")
            raise

    def find_many(self, collection: str, query: Dict = None, 
                 sort: List = None, limit: int = 0, skip: int = 0) -> List[Dict]:
        try:
            cursor = self.db[collection].find(query or {})
            
            if sort:
                cursor = cursor.sort(sort)
            if skip:
                cursor = cursor.skip(skip)
            if limit:
                cursor = cursor.limit(limit)
                
            return list(cursor)
        except OperationFailure as e:
            logging.error(f"Database operation failed: {str(e)}")
            raise

    def insert_one(self, collection: str, document: Dict) -> ObjectId:
        try:
            result = self.db[collection].insert_one(document)
            return result.inserted_id
        except OperationFailure as e:
            logging.error(f"Database operation failed: {str(e)}")
            raise

    def insert_many(self, collection: str, documents: List[Dict]) -> List[ObjectId]:
        try:
            result = self.db[collection].insert_many(documents)
            return result.inserted_ids
        except OperationFailure as e:
            logging.error(f"Database operation failed: {str(e)}")
            raise

    def update_one(self, collection: str, query: Dict, update: Dict) -> int:
        try:
            result = self.db[collection].update_one(query, update)
            return result.modified_count
        except OperationFailure as e:
            logging.error(f"Database operation failed: {str(e)}")
            raise

    def update_many(self, collection: str, query: Dict, update: Dict) -> int:
        try:
            result = self.db[collection].update_many(query, update)
            return result.modified_count
        except OperationFailure as e:
            logging.error(f"Database operation failed: {str(e)}")
            raise

    def delete_one(self, collection: str, query: Dict) -> int:
        try:
            result = self.db[collection].delete_one(query)
            return result.deleted_count
        except OperationFailure as e:
            logging.error(f"Database operation failed: {str(e)}")
            raise

    def delete_many(self, collection: str, query: Dict) -> int:
        try:
            result = self.db[collection].delete_many(query)
            return result.deleted_count
        except OperationFailure as e:
            logging.error(f"Database operation failed: {str(e)}")
            raise

    def count_documents(self, collection: str, query: Dict = None) -> int:
        try:
            return self.db[collection].count_documents(query or {})
        except OperationFailure as e:
            logging.error(f"Database operation failed: {str(e)}")
            raise

    def aggregate(self, collection: str, pipeline: List[Dict]) -> List[Dict]:
        try:
            return list(self.db[collection].aggregate(pipeline))
        except OperationFailure as e:
            logging.error(f"Database operation failed: {str(e)}")
            raise

    def create_index(self, collection: str, keys: List[tuple], unique: bool = False):
        try:
            self.db[collection].create_index(keys, unique=unique)
        except OperationFailure as e:
            logging.error(f"Database operation failed: {str(e)}")
            raise

    def drop_collection(self, collection: str):
        try:
            self.db[collection].drop()
        except OperationFailure as e:
            logging.error(f"Database operation failed: {str(e)}")
            raise

    def close(self):
        self.client.close()
