interface Evento {
  id: number;
  title: string;
  date: string;
  description: string;
  location: string;
  locationNumber: string;
  locationCity: string;
  locationCEP?: string;
  category?: string;
  created_at: string;
  created_by: string;
}

export default Evento;
