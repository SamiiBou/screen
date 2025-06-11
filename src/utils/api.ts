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
  participationPrice: number
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
    console.log('🔍 [API DEBUG] Getting challenge by ID:', challengeId)
    const response = await this.request(`/challenges/${challengeId}`)
    console.log('🔍 [API DEBUG] Challenge response from backend:', response)
    return response
  }

  async initDefaultChallenges() {
    return this.request('/challenges/init-default', {
      method: 'POST'
    })
  }

  async migrateChallengesParticipationPrice() {
    console.log('🔧 [MIGRATION] Starting migration...')
    const response = await this.request('/challenges/migrate-participation-price', {
      method: 'POST'
    })
    console.log('🔧 [MIGRATION] Migration response:', response)
    return response
  }

  async createChallenge(challengeData: any) {
    console.log('📡 [API DEBUG] Sending challenge data to backend:', challengeData)
    const response = await this.request('/challenges/create', {
      method: 'POST',
      body: JSON.stringify(challengeData)
    })
    console.log('📡 [API DEBUG] Backend response:', response)
    return response
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

  async getChallengeLeaderboard(challengeId: string, page: number = 1, limit: number = 20) {
    return this.request(`/leaderboard/challenge/${challengeId}?page=${page}&limit=${limit}`)
  }

  async getGlobalLeaderboard(page: number = 1, limit: number = 20) {
    return this.request(`/leaderboard/global?page=${page}&limit=${limit}`)
  }

  async getUserStats(userId: string) {
    return this.request(`/leaderboard/user/${userId}`)
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

  // Challenge Payment Methods
  async initiateChallengePayment(challengeId: string) {
    console.log('🚀 [API SERVICE] Initiating challenge payment request:', { challengeId })
    const response = await this.request('/challenges/initiate-participation-payment', {
      method: 'POST',
      body: JSON.stringify({ challengeId })
    })
    console.log('📨 [API SERVICE] Initiate payment response:', response)
    return response
  }

  async confirmChallengePayment(reference: string, transactionId: string) {
    console.log('💰 [API SERVICE] ===== CONFIRMING CHALLENGE PAYMENT =====')
    console.log('💰 [API SERVICE] Request payload:', { 
      reference, 
      transactionId,
      referenceType: typeof reference,
      transactionIdType: typeof transactionId,
      referenceLength: reference?.length,
      transactionIdLength: transactionId?.length
    })
    
    const requestBody = { reference, transaction_id: transactionId }
    console.log('💰 [API SERVICE] Request body being sent:', requestBody)
    console.log('💰 [API SERVICE] Request body JSON:', JSON.stringify(requestBody))
    
    try {
      const response = await this.request('/challenges/confirm-participation-payment', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log('✅ [API SERVICE] Payment confirmation response:', response)
      return response
    } catch (error: any) {
      console.error('❌ [API SERVICE] Payment confirmation failed:', error)
      console.error('❌ [API SERVICE] Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      })
      throw error
    }
  }

  // HODL Token Methods
  async getHodlBalance() {
    return this.request('/hodl/balance')
  }

  async generateHodlVoucher() {
    return this.request('/hodl/generate-voucher', {
      method: 'POST'
    })
  }

  async confirmHodlClaim(transactionHash: string, amount?: string) {
    return this.request('/hodl/claim-success', {
      method: 'POST',
      body: JSON.stringify({ transactionHash, amount })
    })
  }

  async reportFailedHodlClaim(error: string, transactionId?: string) {
    return this.request('/hodl/claim-failed', {
      method: 'POST',
      body: JSON.stringify({ error, transactionId })
    })
  }

  async addHodlTokens(amount: number) {
    return this.request('/hodl/add-tokens', {
      method: 'POST',
      body: JSON.stringify({ amount })
    })
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