import { http, HttpResponse } from 'msw';

// Mock Kodi API responses
export const handlers = [
  // Mock VideoLibrary.GetMovies
  http.post('/jsonrpc', async ({ request }) => {
    const body = (await request.json()) as { method: string; params?: unknown };

    if (body.method === 'VideoLibrary.GetMovies') {
      return HttpResponse.json({
        id: 1,
        jsonrpc: '2.0',
        result: {
          movies: [
            {
              movieid: 1,
              title: 'Test Movie 1',
              year: 2024,
              rating: 8.5,
              runtime: 120,
              playcount: 0,
              art: {
                poster: 'image://test-poster-1/',
                fanart: 'image://test-fanart-1/',
              },
            },
            {
              movieid: 2,
              title: 'Test Movie 2',
              year: 2023,
              rating: 7.2,
              runtime: 95,
              playcount: 1,
              art: {
                poster: 'image://test-poster-2/',
              },
            },
          ],
          limits: { end: 2, start: 0, total: 2 },
        },
      });
    }

    // Mock VideoLibrary.GetMovieDetails
    if (body.method === 'VideoLibrary.GetMovieDetails') {
      return HttpResponse.json({
        id: 1,
        jsonrpc: '2.0',
        result: {
          moviedetails: {
            movieid: 1,
            title: 'Test Movie 1',
            year: 2024,
            rating: 8.5,
            runtime: 120,
            playcount: 0,
            plot: 'This is a test movie plot.',
            director: ['Test Director'],
            genre: ['Action', 'Thriller'],
            cast: [
              { name: 'Actor 1', role: 'Role 1', thumbnail: 'image://actor-1/' },
              { name: 'Actor 2', role: 'Role 2', thumbnail: 'image://actor-2/' },
            ],
            art: {
              poster: 'image://test-poster-1/',
              fanart: 'image://test-fanart-1/',
              clearlogo: 'image://test-logo-1/',
            },
          },
        },
      });
    }

    // Mock VideoLibrary.GetTVShows
    if (body.method === 'VideoLibrary.GetTVShows') {
      return HttpResponse.json({
        id: 1,
        jsonrpc: '2.0',
        result: {
          tvshows: [
            {
              tvshowid: 1,
              title: 'Test TV Show 1',
              year: 2023,
              rating: 9.0,
              episode: 20,
              watchedepisodes: 10,
              art: {
                poster: 'image://test-tvshow-poster-1/',
                fanart: 'image://test-tvshow-fanart-1/',
              },
            },
          ],
          limits: { end: 1, start: 0, total: 1 },
        },
      });
    }

    // Mock VideoLibrary.GetSeasons
    if (body.method === 'VideoLibrary.GetSeasons') {
      return HttpResponse.json({
        id: 1,
        jsonrpc: '2.0',
        result: {
          seasons: [
            {
              season: 1,
              label: 'Season 1',
              episode: 10,
              watchedepisodes: 5,
              art: {
                poster: 'image://season-1-poster/',
              },
            },
          ],
        },
      });
    }

    // Mock VideoLibrary.GetEpisodes
    if (body.method === 'VideoLibrary.GetEpisodes') {
      return HttpResponse.json({
        id: 1,
        jsonrpc: '2.0',
        result: {
          episodes: [
            {
              episodeid: 1,
              title: 'Test Episode 1',
              season: 1,
              episode: 1,
              playcount: 0,
              runtime: 45,
              plot: 'Test episode plot',
              art: {
                thumb: 'image://episode-1-thumb/',
              },
            },
          ],
        },
      });
    }

    // Mock AudioLibrary.GetArtists
    if (body.method === 'AudioLibrary.GetArtists') {
      return HttpResponse.json({
        id: 1,
        jsonrpc: '2.0',
        result: {
          artists: [
            {
              artistid: 1,
              label: 'The Beatles',
              artist: 'The Beatles',
              genre: ['Rock', 'Pop'],
              description: 'The Beatles were an English rock band formed in Liverpool in 1960.',
              formed: '1960',
              disbanded: '1970',
              yearsactive: ['1960-1970'],
              style: ['British Invasion', 'Psychedelic Rock'],
              mood: ['Happy', 'Reflective'],
              art: {
                thumb: 'image://test-artist-thumb-1/',
                fanart: 'image://test-artist-fanart-1/',
              },
              thumbnail: 'image://test-artist-thumb-1/',
              fanart: 'image://test-artist-fanart-1/',
              dateadded: '2024-01-15 10:30:00',
            },
            {
              artistid: 2,
              label: 'Pink Floyd',
              artist: 'Pink Floyd',
              genre: ['Progressive Rock', 'Psychedelic Rock'],
              description: 'Pink Floyd were an English rock band formed in London in 1965.',
              formed: '1965',
              disbanded: '1995',
              yearsactive: ['1965-1995'],
              style: ['Progressive Rock', 'Art Rock'],
              mood: ['Dark', 'Atmospheric'],
              art: {
                thumb: 'image://test-artist-thumb-2/',
                fanart: 'image://test-artist-fanart-2/',
              },
              thumbnail: 'image://test-artist-thumb-2/',
              fanart: 'image://test-artist-fanart-2/',
              dateadded: '2024-01-16 14:00:00',
            },
            {
              artistid: 3,
              label: 'Miles Davis',
              artist: 'Miles Davis',
              genre: ['Jazz'],
              description:
                'Miles Dewey Davis III was an American trumpeter, bandleader, and composer.',
              born: '1926-05-26',
              died: '1991-09-28',
              yearsactive: ['1944-1991'],
              instrument: ['Trumpet'],
              art: {
                thumb: 'image://test-artist-thumb-3/',
                fanart: 'image://test-artist-fanart-3/',
              },
              thumbnail: 'image://test-artist-thumb-3/',
              dateadded: '2024-02-01 08:00:00',
            },
          ],
          limits: { end: 3, start: 0, total: 3 },
        },
      });
    }

    // Mock AudioLibrary.GetArtistDetails
    if (body.method === 'AudioLibrary.GetArtistDetails') {
      return HttpResponse.json({
        id: 1,
        jsonrpc: '2.0',
        result: {
          artistdetails: {
            artistid: 1,
            label: 'The Beatles',
            artist: 'The Beatles',
            genre: ['Rock', 'Pop'],
            description:
              'The Beatles were an English rock band formed in Liverpool in 1960. The group consisted of John Lennon, Paul McCartney, George Harrison, and Ringo Starr.',
            formed: '1960',
            disbanded: '1970',
            yearsactive: ['1960-1970'],
            style: ['British Invasion', 'Psychedelic Rock'],
            mood: ['Happy', 'Reflective', 'Energetic'],
            instrument: ['Guitar', 'Bass', 'Drums', 'Vocals'],
            isalbumartist: true,
            art: {
              thumb: 'image://test-artist-thumb-1/',
              fanart: 'image://test-artist-fanart-1/',
              clearlogo: 'image://test-artist-logo-1/',
            },
            thumbnail: 'image://test-artist-thumb-1/',
            fanart: 'image://test-artist-fanart-1/',
          },
        },
      });
    }

    // Mock AudioLibrary.GetAlbums
    if (body.method === 'AudioLibrary.GetAlbums') {
      return HttpResponse.json({
        id: 1,
        jsonrpc: '2.0',
        result: {
          albums: [
            {
              albumid: 1,
              label: 'Abbey Road',
              title: 'Abbey Road',
              artist: ['The Beatles'],
              artistid: [1],
              displayartist: 'The Beatles',
              genre: ['Rock'],
              year: 1969,
              rating: 9.5,
              albumlabel: 'Apple Records',
              art: {
                thumb: 'image://test-album-thumb-1/',
                fanart: 'image://test-album-fanart-1/',
              },
              thumbnail: 'image://test-album-thumb-1/',
              playcount: 5,
              dateadded: '2024-01-15 10:30:00',
            },
            {
              albumid: 2,
              label: 'The Dark Side of the Moon',
              title: 'The Dark Side of the Moon',
              artist: ['Pink Floyd'],
              artistid: [2],
              displayartist: 'Pink Floyd',
              genre: ['Progressive Rock'],
              year: 1973,
              rating: 9.8,
              albumlabel: 'Harvest',
              art: {
                thumb: 'image://test-album-thumb-2/',
              },
              thumbnail: 'image://test-album-thumb-2/',
              playcount: 3,
              dateadded: '2024-01-16 14:00:00',
            },
            {
              albumid: 3,
              label: 'Kind of Blue',
              title: 'Kind of Blue',
              artist: ['Miles Davis'],
              artistid: [3],
              displayartist: 'Miles Davis',
              genre: ['Jazz'],
              year: 1959,
              rating: 9.7,
              albumlabel: 'Columbia',
              art: {
                thumb: 'image://test-album-thumb-3/',
              },
              thumbnail: 'image://test-album-thumb-3/',
              playcount: 0,
              dateadded: '2024-02-01 08:00:00',
            },
          ],
          limits: { end: 3, start: 0, total: 3 },
        },
      });
    }

    // Mock AudioLibrary.GetAlbumDetails
    if (body.method === 'AudioLibrary.GetAlbumDetails') {
      return HttpResponse.json({
        id: 1,
        jsonrpc: '2.0',
        result: {
          albumdetails: {
            albumid: 1,
            label: 'Abbey Road',
            title: 'Abbey Road',
            artist: ['The Beatles'],
            artistid: [1],
            displayartist: 'The Beatles',
            genre: ['Rock'],
            year: 1969,
            rating: 9.5,
            description:
              'Abbey Road is the eleventh studio album by the English rock band the Beatles.',
            albumlabel: 'Apple Records',
            type: 'album',
            style: ['Classic Rock'],
            mood: ['Uplifting'],
            art: {
              thumb: 'image://test-album-thumb-1/',
              fanart: 'image://test-album-fanart-1/',
            },
            thumbnail: 'image://test-album-thumb-1/',
            fanart: 'image://test-album-fanart-1/',
            playcount: 5,
          },
        },
      });
    }

    // Mock AudioLibrary.GetSongs
    if (body.method === 'AudioLibrary.GetSongs') {
      return HttpResponse.json({
        id: 1,
        jsonrpc: '2.0',
        result: {
          songs: [
            {
              songid: 1,
              label: 'Come Together',
              title: 'Come Together',
              artist: ['The Beatles'],
              artistid: [1],
              album: 'Abbey Road',
              albumid: 1,
              genre: ['Rock'],
              year: 1969,
              track: 1,
              disc: 1,
              duration: 259,
              file: '/music/beatles/abbey_road/01_come_together.mp3',
              art: { thumb: 'image://test-album-thumb-1/' },
              thumbnail: 'image://test-album-thumb-1/',
              playcount: 3,
            },
            {
              songid: 2,
              label: 'Something',
              title: 'Something',
              artist: ['The Beatles'],
              artistid: [1],
              album: 'Abbey Road',
              albumid: 1,
              genre: ['Rock'],
              year: 1969,
              track: 2,
              disc: 1,
              duration: 182,
              file: '/music/beatles/abbey_road/02_something.mp3',
              art: { thumb: 'image://test-album-thumb-1/' },
              thumbnail: 'image://test-album-thumb-1/',
              playcount: 5,
            },
            {
              songid: 3,
              label: 'Here Comes the Sun',
              title: 'Here Comes the Sun',
              artist: ['The Beatles'],
              artistid: [1],
              album: 'Abbey Road',
              albumid: 1,
              genre: ['Rock'],
              year: 1969,
              track: 7,
              disc: 1,
              duration: 185,
              file: '/music/beatles/abbey_road/07_here_comes_the_sun.mp3',
              art: { thumb: 'image://test-album-thumb-1/' },
              thumbnail: 'image://test-album-thumb-1/',
              playcount: 10,
            },
          ],
          limits: { end: 3, start: 0, total: 3 },
        },
      });
    }

    // Mock AudioLibrary.GetSongDetails
    if (body.method === 'AudioLibrary.GetSongDetails') {
      return HttpResponse.json({
        id: 1,
        jsonrpc: '2.0',
        result: {
          songdetails: {
            songid: 1,
            label: 'Come Together',
            title: 'Come Together',
            artist: ['The Beatles'],
            artistid: [1],
            album: 'Abbey Road',
            albumid: 1,
            genre: ['Rock'],
            year: 1969,
            track: 1,
            disc: 1,
            duration: 259,
            file: '/music/beatles/abbey_road/01_come_together.mp3',
            art: { thumb: 'image://test-album-thumb-1/' },
            thumbnail: 'image://test-album-thumb-1/',
            playcount: 3,
          },
        },
      });
    }

    // Mock AudioLibrary.GetGenres
    if (body.method === 'AudioLibrary.GetGenres') {
      return HttpResponse.json({
        id: 1,
        jsonrpc: '2.0',
        result: {
          genres: [
            { genreid: 1, label: 'Rock', title: 'Rock' },
            { genreid: 2, label: 'Pop', title: 'Pop' },
            { genreid: 3, label: 'Jazz', title: 'Jazz' },
            { genreid: 4, label: 'Progressive Rock', title: 'Progressive Rock' },
            { genreid: 5, label: 'Psychedelic Rock', title: 'Psychedelic Rock' },
          ],
          limits: { end: 5, start: 0, total: 5 },
        },
      });
    }

    // Mock Playlist.Add
    if (body.method === 'Playlist.Add') {
      return HttpResponse.json({
        id: 1,
        jsonrpc: '2.0',
        result: 'OK',
      });
    }

    // Mock Player.Open
    if (body.method === 'Player.Open') {
      return HttpResponse.json({
        id: 1,
        jsonrpc: '2.0',
        result: 'OK',
      });
    }

    // Mock Player.GetActivePlayers
    if (body.method === 'Player.GetActivePlayers') {
      return HttpResponse.json({
        id: 1,
        jsonrpc: '2.0',
        result: [],
      });
    }

    // Default response for unhandled methods
    return HttpResponse.json(
      {
        id: 1,
        jsonrpc: '2.0',
        error: { code: -32601, message: 'Method not found' },
      },
      { status: 404 }
    );
  }),
];
