import type { Track, StreamResponse, LibraryTrack, Playlist } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api'

// Store token in memory and localStorage for persistence
let authToken: string | null = localStorage.getItem('peerless_auth_token')

export function setAuthToken(token: string | null) {
  authToken = token
  if (token) {
    localStorage.setItem('peerless_auth_token', token)
  } else {
    localStorage.removeItem('peerless_auth_token')
  }
}

export function getAuthToken(): string | null {
  return authToken
}

// Helper to get auth headers
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  return headers
}

export async function searchTracks(query: string): Promise<Track[]> {
  if (!query.trim()) return []

  const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)

  if (!response.ok) {
    throw new Error('Search failed')
  }

  return response.json()
}

export async function streamTrack(videoId: string): Promise<StreamResponse> {
  const response = await fetch(`${API_BASE}/stream/${videoId}`)

  if (response.status === 202) {
    throw new Error('Track is being processed. Please try again shortly.')
  }

  if (!response.ok) {
    throw new Error('Failed to load track')
  }

  return response.json()
}

export async function getLibrary(): Promise<LibraryTrack[]> {
  const response = await fetch(`${API_BASE}/library`)

  if (!response.ok) {
    throw new Error('Failed to fetch library')
  }

  return response.json()
}

export async function checkTrackCached(videoId: string): Promise<{
  cached: boolean
  track_id: string | null
  audio_url: string | null
}> {
  const response = await fetch(`${API_BASE}/check/${videoId}`)

  if (!response.ok) {
    return { cached: false, track_id: null, audio_url: null }
  }

  return response.json()
}

// ============== Identity API ==============

export interface Identity {
  id: string
  username: string
  display_name?: string
  token: string
}

export async function createIdentity(
  username: string,
  password: string,
  displayName?: string,
  playlistIds?: string[]
): Promise<Identity> {
  const response = await fetch(`${API_BASE}/identity/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      username,
      password,
      display_name: displayName,
      playlist_ids: playlistIds,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to create identity')
  }

  const data = await response.json()
  setAuthToken(data.token)
  return data
}

export async function loginIdentity(username: string, password: string): Promise<Identity> {
  const response = await fetch(`${API_BASE}/identity/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Invalid credentials')
  }

  const data = await response.json()
  setAuthToken(data.token)
  return data
}

export async function logoutIdentity(): Promise<void> {
  await fetch(`${API_BASE}/identity/logout`, {
    method: 'POST',
    credentials: 'include',
  })
  setAuthToken(null)
}

export async function getCurrentIdentity(): Promise<{
  authenticated: boolean
  user: { id: string; username: string; display_name?: string } | null
}> {
  const response = await fetch(`${API_BASE}/identity/me`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  })

  if (!response.ok) {
    return { authenticated: false, user: null }
  }

  return response.json()
}

// ============== Playlist API ==============

export async function getPlaylists(): Promise<Playlist[]> {
  const response = await fetch(`${API_BASE}/playlists`, {
    headers: getAuthHeaders(),
    credentials: 'include',
  })

  if (!response.ok) {
    return []
  }

  const data = await response.json()
  return transformPlaylists(data)
}

export async function getPlaylistsByIds(playlistIds: string[]): Promise<Playlist[]> {
  if (playlistIds.length === 0) return []
  
  const response = await fetch(`${API_BASE}/playlists/anonymous`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playlist_ids: playlistIds }),
  })

  if (!response.ok) {
    return []
  }

  const data = await response.json()
  return transformPlaylists(data)
}

export async function createPlaylistApi(name: string, description?: string): Promise<Playlist> {
  const response = await fetch(`${API_BASE}/playlists`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ name, description }),
  })

  if (!response.ok) {
    throw new Error('Failed to create playlist')
  }

  return transformPlaylist(await response.json())
}

export async function updatePlaylistApi(
  playlistId: string,
  updates: { name?: string; description?: string; coverImage?: string }
): Promise<Playlist> {
  const response = await fetch(`${API_BASE}/playlists/${playlistId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({
      name: updates.name,
      description: updates.description,
      cover_image: updates.coverImage,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to update playlist')
  }

  return transformPlaylist(await response.json())
}

export async function deletePlaylistApi(playlistId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/playlists/${playlistId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to delete playlist')
  }
}

export async function addTrackToPlaylistApi(playlistId: string, track: Track): Promise<Playlist> {
  const response = await fetch(`${API_BASE}/playlists/${playlistId}/tracks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({
      video_id: track.video_id,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail,
      duration: track.duration,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to add track to playlist')
  }

  return transformPlaylist(await response.json())
}

export async function removeTrackFromPlaylistApi(playlistId: string, videoId: string): Promise<Playlist> {
  const response = await fetch(`${API_BASE}/playlists/${playlistId}/tracks/${videoId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to remove track from playlist')
  }

  return transformPlaylist(await response.json())
}

// Transform API response to frontend Playlist type
function transformPlaylist(p: Record<string, unknown>): Playlist {
  return {
    id: p.id as string,
    name: p.name as string,
    description: p.description as string | undefined,
    tracks: ((p.tracks as Array<Record<string, unknown>>) || []).map((t) => ({
      video_id: t.video_id as string,
      title: t.title as string,
      artist: t.artist as string,
      thumbnail: t.thumbnail as string,
      duration: (t.duration as number) || 0,
    })),
    createdAt: p.created_at as string,
    updatedAt: p.updated_at as string,
    coverImage: p.cover_image as string | undefined,
    userId: p.user_id as string | undefined,
  }
}

function transformPlaylists(data: Array<Record<string, unknown>>): Playlist[] {
  return data.map(transformPlaylist)
}
