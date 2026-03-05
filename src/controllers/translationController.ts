import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getTranslationAction = async (req: Request, res: Response) => {
  let { lng } = req.params;
  const { ns = 'common' } = req.params;
  if (Array.isArray(lng)) lng = lng[0];
  const allowedLngs = ['en', 'ua'];

  if (!allowedLngs.includes(lng)) {
    return res.status(400).json({ error: `Invalid language: ${lng}` });
  }

  const translationPath = path.join(
    __dirname,
    `../locales/${lng}/${ns}.json`,
  );

  try {
    const translation = await fs.readFile(translationPath, 'utf8');
    return res.json(JSON.parse(translation));
  } catch (err) {
    console.error(`Translation not found: ${lng}/${ns}`, err);
    return res
      .status(404)
      .json({ error: `Translation ${lng}/${ns} not found` });
  }
};
