/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from 'mongodb';

/**
 * Convert MongoDB documents to plain objects for client components
 */
export function serializeDocument<T>(doc: T): T {
  if (doc === null || doc === undefined) {
    return doc;
  }

  if (doc instanceof ObjectId) {
    return doc.toString() as unknown as T;
  }

  if (doc instanceof Date) {
    return doc.toISOString() as unknown as T;
  }

  if (Array.isArray(doc)) {
    return doc.map(serializeDocument) as unknown as T;
  }

  if (typeof doc === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(doc)) {
      result[key] = serializeDocument(value);
    }
    return result as T;
  }

  return doc;
}

/**
 * Convert array of MongoDB documents to plain objects
 */
export function serializeDocuments<T>(docs: T[]): T[] {
  return docs.map(serializeDocument);
}