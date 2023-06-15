import {MongoMemoryServer} from "mongodb-memory-server";
import {UserModel, GameSaveModel} from "../src/Models";
import * as UserService from "../src/UserService";
import mongoose from "mongoose";

let mongo_server: MongoMemoryServer | null = null;

beforeAll(async () => {
    mongo_server = await MongoMemoryServer.create();
    await mongoose.connect(mongo_server.getUri())
})

afterEach(async () => {
    for (let collectionsKey in mongoose.connection.collections) {
        await mongoose.connection.db.dropCollection(collectionsKey)
    }
})

afterAll(async () => {
    await mongoose.disconnect();
    await mongo_server?.stop();
})

test.skip("Remove using the DDD approach", async () => {
    const user = await UserModel.create({name: "Yo mama", bio: "Much fun building pranks"})

    await GameSaveModel.create({
        data: "nonono",
        userId: user._id
    })

    await GameSaveModel.create({
        data: "yeah",
        userId: user._id
    })

    const doc_count_before = await GameSaveModel.count({})
    expect(doc_count_before).toBe(2)
    await UserService.removeUser(user._id)

    const doc_count_after = await GameSaveModel.count({})
    expect(doc_count_after).toBe(0)
})

describe("Removing related user data", () => {
    it("Removing a single user", async () => {
        const user = await UserModel.create({name: "Yo mama", bio: "Much fun building pranks"})

        await GameSaveModel.create({
            data: "nonono",
            userId: user._id
        })

        await GameSaveModel.create({
            data: "yeah",
            userId: user._id
        })

        const doc_count_before = await GameSaveModel.count({})
        expect(doc_count_before).toBe(2)
        await UserModel.deleteOne({_id: user._id});

        const doc_count_after = await GameSaveModel.count({})
        expect(doc_count_after).toBe(0)
    })

    it("Removing multiple users", async () => {
        const user_a = await UserModel.create({name: "Yo mama", bio: "Much fun building pranks"})
        const user_b = await UserModel.create({name: "Lexor", bio: "Ping Pong"})

        await GameSaveModel.create({
            data: "nonono",
            userId: user_a._id
        })

        await GameSaveModel.create({
            data: "yeah",
            userId: user_a._id
        })

        await GameSaveModel.create({
            data: "Lexooooo_yeah",
            userId: user_b._id
        })

        await GameSaveModel.create({
            data: "weeeee yeah",
            userId: user_b._id
        })

        const doc_count_before = await GameSaveModel.count({})
        expect(doc_count_before).toBe(4)

        await UserModel.deleteMany({})

        const doc_count_after = await GameSaveModel.count({})
        expect(doc_count_after).toBe(0)
    })

    it("Works with documents", async () => {
        const user = await UserModel.create({name: "Yo mama", bio: "Much fun building pranks"})

        await GameSaveModel.create({
            data: "nonono",
            userId: user._id
        })

        await GameSaveModel.create({
            data: "yeah",
            userId: user._id
        })

        const doc_count_before = await GameSaveModel.count({})
        expect(doc_count_before).toBe(2)
        await user.deleteOne();

        const doc_count_after = await GameSaveModel.count({})
        expect(doc_count_after).toBe(0)
    })
})
