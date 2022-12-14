import { QueriedContact } from '../types/contact';
import { ImportResponse } from '../types/imports';
import { ContactQueryRequest, ContactsRequestQuery, IContactQueryRequest } from '../types/querying';
import { ITransactionQueryRequest, Transaction, TransactionQueryRequest } from '../types/transaction';
import { WithRequired } from '../types/utils';
import { importStatus } from './meta';

export function createQueue<T>(data: T[], chunkSize: number = 100): T[][] {
  const queue: T[][] = [];
  for (let i = 0; i < data.length; i += chunkSize) queue.push(data.slice(i, i + chunkSize));
  return queue;
}

export async function pollForCompletion(jobs: ImportResponse[]) {
  while (jobs.length) {
    await new Promise(r => setTimeout(r, 10000));
    const statuses = await Promise.all(jobs.map(({ id }) => importStatus(id)));
    statuses.forEach(status => status.status === 'complete' && (jobs = jobs.filter(({ id }) => id !== status.id)));
  }
}

import * as contact from './contact';
import * as transaction from './transaction';

export async function getAllFromQuery<T extends typeof contact | typeof transaction>(
  type: T,
  query: WithRequired<T extends typeof contact ? IContactQueryRequest : ITransactionQueryRequest, 'query'>,
): Promise<T extends typeof contact ? QueriedContact[] : Transaction[]> {
  let query_token: string;
  const result = [] as T extends typeof contact ? QueriedContact[] : Transaction[];
  while (true) {
    const {
      query_token: token,
      has_more,
      results,
    } = await type.query(query_token ? { query_token } : (query as ContactQueryRequest & TransactionQueryRequest));

    result.push(...(results as any));
    if (!has_more) break;
    query_token = token;
  }
  return result;
}
