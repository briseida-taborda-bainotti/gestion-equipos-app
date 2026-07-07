import { BaseRepository } from './baseRepository.js';
import { Equipo } from '../models/index.js';

class EquiposRepository extends BaseRepository {
  constructor() {
    super(Equipo);
  }
}

export const equiposRepository = new EquiposRepository();
