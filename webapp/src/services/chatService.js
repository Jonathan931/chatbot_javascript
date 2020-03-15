import api from './api';

export const ServiceChat = {
  getPerguntaSugerida: () => api.get('/pergunta'),
  fazerPergunta: pergunta => api.post('response', { pergunta }),
};
