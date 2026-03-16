/**
 * DI Container — wires domain package services for injection into Fastify routes.
 *
 * Usage pattern:
 * 1. Import the service interface from @vvs/contracts
 * 2. Import the implementation from the domain package
 * 3. Register it here with a key
 * 4. Access via request.container.get('serviceName') in routes
 *
 * Example (once auth package is implemented):
 *   import type { IAuthService } from "@vvs/contracts";
 *   import { AuthService } from "@vvs/auth";
 *   container.set("authService", new AuthService(db));
 */

export class Container {
    private services = new Map<string, unknown>();

    set<T>(key: string, service: T): void {
        this.services.set(key, service);
    }

    get<T>(key: string): T {
        const service = this.services.get(key);
        if (!service) {
            throw new Error(`Service '${key}' not registered in container`);
        }
        return service as T;
    }

    has(key: string): boolean {
        return this.services.has(key);
    }
}

export function createContainer(): Container {
    const container = new Container();

    // Register services here as domain packages are implemented:
    // container.set("authService", new AuthService(db));
    // container.set("walletService", new WalletService(db));

    return container;
}
