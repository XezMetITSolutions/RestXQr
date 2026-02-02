const { sequelize } = require('../src/models');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connection OK!');
    } catch (error) {
        console.error('Connection Failed:', error);
    } finally {
        await sequelize.close();
    }
}

test();
