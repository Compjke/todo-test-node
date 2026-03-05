import { Types } from 'mongoose';

export const toObjectId = (id: string) => new Types.ObjectId(id);
