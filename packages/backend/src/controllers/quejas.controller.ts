import type { Request, Response, NextFunction } from 'express';
import {
  estadoQuejaSchema,
  tipoQuejaSchema,
  type CrearQuejaInput,
} from '@mv-quejas/shared';
import * as quejasService from '../services/quejas.service.js';
import { HttpError } from '../middleware/errorHandler.js';

export async function postQueja(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // El body ya viene validado por validateBody(crearQuejaSchema)
    const queja = await quejasService.crearQueja(req.body as CrearQuejaInput);
    res.status(201).json({ success: true, data: queja });
  } catch (err) {
    next(err);
  }
}

export async function getQuejas(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const estado = estadoQuejaSchema.optional().parse(req.query.estado);
    const tipo = tipoQuejaSchema.optional().parse(req.query.tipo);
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const offset = req.query.offset ? Number(req.query.offset) : undefined;

    const quejas = await quejasService.listarQuejas({
      estado,
      tipo,
      limit,
      offset,
    });
    res.json({ success: true, data: quejas });
  } catch (err) {
    next(err);
  }
}

export async function getQueja(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpError(400, 'ID invalido', 'INVALID_ID');
    }
    const queja = await quejasService.obtenerQuejaPorId(id);
    if (!queja) {
      throw new HttpError(404, 'Queja no encontrada', 'NOT_FOUND');
    }
    res.json({ success: true, data: queja });
  } catch (err) {
    next(err);
  }
}
