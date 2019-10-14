import Web3 from 'web3'
import { Connectors } from 'web3-react'

const { Connector } = Connectors

export default class NetworkOnlyConnector extends Connector {
  constructor(kwargs) {
    const { providerURL, ...rest } = kwargs || {}
    super(rest)
    this.providerURL = providerURL
  }

  async onActivation() {
    if (!this.engine) {
      const web3 = new Web3(this.providerURL)
      this.engine = web3
    }
  }

  async getNetworkId(provider) {
    const web3 = new Web3(provider)
    const networkId = await web3.eth.net.getId()
    return super._validateNetworkId(networkId)
  }

  async getProvider() {
    return this.engine.currentProvider
  }

  async getAccount() {
    return null
  }
}
