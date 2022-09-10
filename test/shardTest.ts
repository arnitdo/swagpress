import testSwagpress from './sharedConfig'

import * as mocha from 'mocha'
import * as assert from "assert";

mocha.describe("Shards", () => {
	const homePath = "/home/"
	const [homeRoute, homeRouteShard] = testSwagpress.createShard(homePath)
	const postsPath = "/posts"
	const resolvedPostsPath = testSwagpress.routeWithShard(homeRouteShard,postsPath)
	const [adminRoute, adminRouteShard] = testSwagpress.createShard("/admin")
	mocha.describe("Shard route resolution", () => {
		mocha.it("Correctly resolve route to '/home/posts'", () => {
			assert.equal(resolvedPostsPath, "/home/posts")
		})
	})
	mocha.describe("Shard deletion", () => {
		mocha.it("Successfully delete shard", () => {
			let deletedShardStatus = testSwagpress.deleteShard(adminRouteShard)
			assert.equal(deletedShardStatus, true, "Shard deleted successfully")
		})
		mocha.it("Redeletion of shard has no effect", () => {
			let deletedShardStatus = testSwagpress.deleteShard(adminRouteShard)
			assert.equal(deletedShardStatus, false, "Re-deletion has no effect")
		})
	})
})