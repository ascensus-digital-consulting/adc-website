const { ADCUtils } = require('./ADCUtils');

class ADCInfraNames {
  constructor(host) {
    this.#envId = host ? ADCUtils.capitalize(host) : 'Prod';
  }

  #envId;

  get bucketName() {
    return `ADCWeb${this.#envId}Bucket`;
  }

  get distributionName() {
    return `ADCWeb${this.#envId}Distribution`;
  }

  get deploymentName() {
    return `ADCWeb${this.#envId}Deployment`;
  }

  get aliasRecordName() {
    return `ADCWeb${this.#envId}ARecord`;
  }

  get cachePolicyName() {
    return `ADCWeb${this.#envId}CachePolicy`;
  }
}

module.exports = { ADCInfraNames };
