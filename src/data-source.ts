import type { ClusterConfig, ScyllaSession } from "@lambda-group/scylladb";
import { Cluster } from "@lambda-group/scylladb";
import type { BaseEntity } from "./entity/base";
import { Repository } from "./repository/base";

export class DataSource {
	private cluster: Cluster;
	private session: ScyllaSession | null = null;

	constructor(private options: ClusterConfig) {
		this.cluster = new Cluster(this.options);
	}

	async initialize(keyspace?: string): Promise<DataSource> {
		this.session = await this.cluster.connect(keyspace);

		return this;
	}

	getSession(): ScyllaSession | never {
		if (!this.session) throw new Error("No session available");

		return this.session;
	}

	getRepository<T extends BaseEntity>(
		entity: new () => T extends BaseEntity ? T : never,
	): Repository<T> {
		return new Repository<T>(this, entity);
	}

	[Symbol.dispose]() {
		// NOTE: perhaps we should implement a proper cleanup here, session.close();
		if (this.session) {
			this.session = null;
		}
	}
}
