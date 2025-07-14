import {
  CalculateRouteOptions,
  CalculateRouteResponse,
} from "../routes/calculate-route/types";
import { buildCalculateRouteRequest } from "../routes/calculate-route";

class TomTom {
  public baseUrl: string = "https://api.tomtom.com";

  /**
   * Creates an instance of TomTom.
   *
   * @param apiKey - Your TomTom API key.
   * @param versionNumber - The API version to use (defaults to '1').
   */
  constructor(
    public readonly apiKey: string,
    public readonly versionNumber: string = "1"
  ) {}

  public async calculateRoute(
    options: CalculateRouteOptions
  ): Promise<CalculateRouteResponse> {
    const url = buildCalculateRouteRequest(options);

    return this.fetchData<CalculateRouteResponse>(url);
  }

  private async fetchData<T>(url: string): Promise<T> {
    if (url.endsWith("?")) {
      url = url.replace("?", `?key=${this.apiKey}`);
    } else {
      url = `${url}&key=${this.apiKey}`;
    }

    console.log(url);
    const response = await fetch(
      `${this.baseUrl}/routing/${this.versionNumber}${url}`,
      {
        headers: {
          "Accept-Encoding": "gzip",
          "Content-Type": "application/json",
        },
      }
    );

    return response.json() as Promise<T>;
  }
}

export { TomTom };
