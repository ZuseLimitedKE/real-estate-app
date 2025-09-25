import { ObjectId } from 'mongodb';

/**
 * Serialize MongoDB-specific types within a value into plain JavaScript-friendly values for client consumption.
 *
 * @param doc - The value to serialize; may be a document, array, primitive, `null`, or `undefined`.
 * @returns The input value with `ObjectId` converted to its string form, `Date` converted to an ISO string, arrays and objects recursively serialized, and other primitives returned unchanged.
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
 * Serialize each MongoDB document in an array into plain JavaScript-friendly values.
 *
 * @param docs - Array of documents to serialize (may contain ObjectId, Date, nested objects/arrays)
 * @returns A new array where each element is the serialized form of the corresponding input document
 */
export function serializeDocuments<T>(docs: T[]): T[] {
  return docs.map(serializeDocument);
}