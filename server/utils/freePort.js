const freePort = (port, agents) => {
    for (let agent of agents) {
        if (agent.port === port) {
            agent.isFree = true;
        }
    }
};

module.exports = freePort;