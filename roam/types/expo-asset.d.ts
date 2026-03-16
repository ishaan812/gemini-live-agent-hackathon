declare module 'expo-asset' {
  export class Asset {
    localUri: string | null
    uri: string
    name: string
    type: string
    hash: string | null
    width: number | null
    height: number | null
    downloaded: boolean
    static fromModule(virtualAssetModule: number | string): Asset
    static loadAsync(moduleId: number | number[]): Promise<Asset[]>
    downloadAsync(): Promise<this>
  }
}
