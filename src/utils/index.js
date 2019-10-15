import * as web3Utils from 'web3-utils'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'

export { getGasPrice, getPriceConvertionRate } from './apis'

export function safeAccess(object, path) {
  return object
    ? path.reduce(
        (accumulator, currentValue) =>
          accumulator && accumulator[currentValue]
            ? accumulator[currentValue]
            : null,
        object,
      )
    : null
}

export function isAddress(address) {
  return web3Utils.isAddress(address)
}

export function shortenAddress(address, digits = 4) {
  if (!isAddress(address)) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${address.substring(0, digits + 2)}...${address.substring(
    42 - digits,
  )}`
}

export function getContract(address, abi, library, from) {
  if (!isAddress(address) || address === ethers.constants.AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new library.eth.Contract(abi, address, { from })
}

export function amountFormatter(amount, baseDecimals, displayDecimals = 4) {
  if (
    baseDecimals > 18 ||
    displayDecimals > 18 ||
    displayDecimals > baseDecimals
  ) {
    throw Error(
      `Invalid combination of baseDecimals '${baseDecimals}' and displayDecimals '${displayDecimals}.`,
    )
  }

  if (!amount) {
    return undefined
  }

  if (!BigNumber.isBigNumber(amount)) {
    amount = new BigNumber(amount)
  }

  if (amount.isZero()) {
    return '0'
  }

  return amount
    .div(new BigNumber(10).pow(new BigNumber(baseDecimals)))
    .toFixed(displayDecimals)
}

export function dateFormatter(timestamp) {
  return new Date(timestamp).toLocaleString(undefined, { hour12: false })
}
