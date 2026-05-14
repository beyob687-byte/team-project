// Adapter to map old clubsApi names to clubService
import { clubService } from "../services/clubs";

export const clubsApi = {
  getClubs: async (params) => clubService.getAll(params),
  getClub: async (id) => clubService.getById(id),
  createClub: async (data) => clubService.create(data),
  updateClub: async (id, data) => clubService.update(id, data),
  joinClub: async (id) => clubService.joinRequest(id),
};
