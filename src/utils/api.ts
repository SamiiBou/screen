const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://0cb30698e141.ngrok.app/api'
  : 'https://0cb30698e141.ngrok.app/api'

export interface User {
  id: string
  username: string
  email: string
  bestTime: number
  totalChallengesPlayed: number
}

export interface Challenge {
  _id: string
  title: string
  description: string
  startDate: string
  endDate: string
  maxParticipants: number
  currentParticipants: number
  prizePool: number
  status: 'upcoming' | 'active' | 'completed'
}

export interface LeaderboardEntry {
  rank: number
  username: string
  timeHeld: number
  challengesCompleted: number
  eliminationReason: string
  participationDate: string
}

class ApiService {
  private token: string | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    }

    if (this.token) {
      (config.headers as Record<string, string>).Authorization = `Bearer ${this.token}`
    }

    try {
      console.log(`🔄 Making request to: ${url}`)
      const response = await fetch(url, config)
      
      console.log(`📡 Response status: ${response.status}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`❌ API Error:`, errorData)
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('❌ API request failed:', error)
      throw error
    }
  }

  // Wallet Authentication Methods
  async getNonce() {
    return this.request('/auth/nonce', {
      method: 'GET'
    })
  }

  async completeSiweAuth(payload: any, nonce: string, minikitUserData?: any) {
    const data = await this.request('/auth/complete-siwe', {
      method: 'POST',
      body: JSON.stringify({ payload, nonce, minikitUserData })
    })
    
    if (data.token) {
      this.setToken(data.token)
    }
    
    return data
  }

  async getProfile() {
    return this.request('/auth/me')
  }

  async getStats() {
    return this.request('/auth/stats')
  }

  // Game-related methods
  async getChallenges() {
    return this.request('/challenges')
  }

  async getActiveChallenges() {
    return this.request('/challenges/active')
  }

  async getChallengeStats() {
    return this.request('/challenges/stats')
  }

  async getChallengeById(challengeId: string) {
    return this.request(`/challenges/${challengeId}`)
  }

  async initDefaultChallenges() {
    return this.request('/challenges/init-default', {
      method: 'POST'
    })
  }

  async createChallenge(challengeData: any) {
    return this.request('/challenges/create', {
      method: 'POST',
      body: JSON.stringify(challengeData)
    })
  }

  async joinChallenge(challengeId: string) {
    return this.request(`/challenges/${challengeId}/participate`, {
      method: 'POST'
    })
  }

  async participateInChallenge(challengeId: string, participationData: any) {
    return this.request(`/challenges/${challengeId}/participate`, {
      method: 'POST',
      body: JSON.stringify(participationData)
    })
  }

  async canParticipateInChallenge(challengeId: string) {
    return this.request(`/challenges/${challengeId}/can-participate`)
  }

  async submitChallengeResult(challengeId: string, result: any) {
    return this.request(`/challenges/${challengeId}/result`, {
      method: 'POST',
      body: JSON.stringify(result)
    })
  }

  async getLeaderboard(timeframe: string = 'all') {
    return this.request(`/leaderboard?timeframe=${timeframe}`)
  }

  async setupChallenge(challengeData: any) {
    return this.request('/setup/challenge', {
      method: 'POST',
      body: JSON.stringify(challengeData)
    })
  }

  async getSetupStatus() {
    return this.request('/setup/status')
  }

  // Utility methods
  logout() {
    this.setToken(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('walletAddress')
      localStorage.removeItem('username')
      localStorage.removeItem('isAuthenticated')
    }
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  // Legacy method compatibility (can be removed if not used elsewhere)
  async register() {
    throw new Error('Register with email is deprecated. Please use wallet authentication.')
  }

  async login() {
    throw new Error('Login with email is deprecated. Please use wallet authentication.')
  }
}

export const apiService = new ApiService()
export default apiService