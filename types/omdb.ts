export type MovieType = 'movie' | 'series'

export interface MovieSummary {
  imdbID: string
  Title: string
  Year: string
  Type: string
  Poster: string
}

export interface MovieRating {
  Source: string
  Value: string
}

export interface MovieDetail extends MovieSummary {
  Rated: string
  Released: string
  Runtime: string
  Genre: string
  Director: string
  Writer: string
  Actors: string
  Plot: string
  Language: string
  Country: string
  Awards: string
  Ratings: MovieRating[]
  Metascore: string
  imdbRating: string
  imdbVotes: string
  BoxOffice?: string
  totalSeasons?: string
}

export interface SearchResponse {
  movies: MovieSummary[]
  total: number
}
