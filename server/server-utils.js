export async function createSession(dbContext, sessionInformation, sessionID) {
    return set(dbContext, sessionID, JSON.stringify(sessionInformation));
}

export async function getSession(dbContext, sessionID) {
    return get(dbContext, sessionID);
}

export async function updateSession(dbContext, sessionInformation, sessionID) {
    return set(dbContext, sessionID, JSON.stringify(sessionInformation));
}

export async function deleteSession(dbContext, sessionID) {
    return del(dbContext, sessionID);
}

export async function getAllPlayerData(dbContext) {
    const keys = await dbContext.keys('*');

    let promises = [];

    keys.forEach(key => {
        promises.push(get(dbContext, key));
    });

    let resolved = await Promise.all(promises);
    let result = {}

    keys.forEach(key => {
        result[key] = resolved.shift();
    });

    return result;
}

async function del(dbContext, key) {
    console.log(`Deleting key ${key}`);
    return dbContext.del(key);
}

async function get(dbContext, key) {
    console.log(`Getting values for key ${key}`);
    return dbContext.get(key);
}

async function set(dbContext, key, value) {
    console.log(`Writing ${value} to key ${key}`);
    return dbContext.set(String(key), String(value));
}