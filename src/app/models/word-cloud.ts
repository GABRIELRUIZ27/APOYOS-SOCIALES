import { Seccion } from './seccion';

export interface WordCloud {
  name: string;
  weight: number;
}

export interface GeneralWordCloud {
  generalWordCloud: WordCloud[];
  wordCloudPorMunicipios: MunicipiotoWordCloud[];
}

export interface MunicipiotoWordCloud extends Seccion {
  wordCloud: WordCloud[];
}
