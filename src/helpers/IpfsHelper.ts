import { appConfig } from "config";
import { create } from 'ipfs-http-client';
import { EnvHelper } from "./UtilityHelper";

export const productionIpfsGateway: string = 'https://epns-gateway.infura-ipfs.io/ipfs/';
export const developmentIpfsGateway: string = 'https://epns-testing.infura-ipfs.io/ipfs/';

export const IPFSGateway = EnvHelper.isProduction() ? productionIpfsGateway : developmentIpfsGateway;

export const IPFSupload = async (input: string) => {
  const bufferInput = Buffer.from(input);
  const projectId = appConfig.ipfsInfuraAPIKey;
  const projectSecret = appConfig.ipfsInfuraAPISecret;
  const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

  // const client = create({
  //   host: 'ipfs.infura.io',
  //   port: 5001,
  //   protocol: 'https',
  //   apiPath: '/api/v0',
  //   headers: {
  //     authorization: auth
  //   }
  // });

  const client = create({
    host: "ipfs.push.org",
    port: 5001,
    protocol: "http",
  });

  try {
    const storagePointer = await client.add(bufferInput, {pin: true});
    return storagePointer?.path;
  } catch (err) {
    throw Error(err);
  }
}