require('dotenv').config();
const { sequelize } = require('./db');
const { Organisation, User, Employee, Team, EmployeeTeam } = require('./models');

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        await sequelize.sync({ force: true });
        console.log('✓ Database tables created');

        const org = await Organisation.create({
            name: 'Tech Solutions Inc.'
        });
        console.log('✓ Created organisation:', org.name);

        const password_hash = await User.hashPassword('password123');

        const user1 = await User.create({
            email: 'admin@techsolutions.com',
            password_hash,
            organisation_id: org.id
        });
        console.log('✓ Created user:', user1.email);

        const user2 = await User.create({
            email: 'hr@techsolutions.com',
            password_hash,
            organisation_id: org.id
        });
        console.log('✓ Created user:', user2.email);

        const employees = await Employee.bulkCreate([
            {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@techsolutions.com',
                organisation_id: org.id
            },
            {
                first_name: 'Jane',
                last_name: 'Smith',
                email: 'jane.smith@techsolutions.com',
                organisation_id: org.id
            },
            {
                first_name: 'Michael',
                last_name: 'Johnson',
                email: 'michael.johnson@techsolutions.com',
                organisation_id: org.id
            },
            {
                first_name: 'Emily',
                last_name: 'Brown',
                email: 'emily.brown@techsolutions.com',
                organisation_id: org.id
            },
            {
                first_name: 'David',
                last_name: 'Wilson',
                email: 'david.wilson@techsolutions.com',
                organisation_id: org.id
            },
            {
                first_name: 'Sarah',
                last_name: 'Davis',
                email: 'sarah.davis@techsolutions.com',
                organisation_id: org.id
            }
        ]);
        console.log(`✓ Created ${employees.length} employees`);


        const teams = await Team.bulkCreate([
            {
                name: 'Engineering',
                description: 'Software development and engineering team',
                organisation_id: org.id
            },
            {
                name: 'Product',
                description: 'Product management and design team',
                organisation_id: org.id
            },
            {
                name: 'Marketing',
                description: 'Marketing and growth team',
                organisation_id: org.id
            },
            {
                name: 'Sales',
                description: 'Sales and customer success team',
                organisation_id: org.id
            }
        ]);
        console.log(`✓ Created ${teams.length} teams`);

        await EmployeeTeam.bulkCreate([
            { employee_id: employees[0].id, team_id: teams[0].id },
            { employee_id: employees[1].id, team_id: teams[0].id },
            { employee_id: employees[2].id, team_id: teams[0].id },
            { employee_id: employees[2].id, team_id: teams[1].id },
            { employee_id: employees[3].id, team_id: teams[1].id },
            { employee_id: employees[4].id, team_id: teams[2].id },
            { employee_id: employees[5].id, team_id: teams[3].id },
            { employee_id: employees[5].id, team_id: teams[2].id }
        ]);
        console.log('✓ Assigned employees to teams');

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n📝 Sample credentials:');
        console.log('   Email: admin@techsolutions.com');
        console.log('   Password: password123');
        console.log('\n   Email: hr@techsolutions.com');
        console.log('   Password: password123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
