// Test script to check if Prisma client has userPreference model
import prisma from './src/prisma';

async function testPrismaModels() {
  try {
    console.log('Available Prisma models:', Object.keys(prisma));
    console.log('Testing userPreference model...');
    
    // Try to query an empty result to test if the model exists
    // Using type assertion for userPreference model
    const result = await (prisma as any).userPreference.findMany({ take: 0 });
    console.log('✅ userPreference model exists and works!');
    
    // Test hasSetPreferences field
    console.log('Testing hasSetPreferences field...');
    const user = await prisma.user.findFirst({ 
      select: { 
        id: true, 
        hasSetPreferences: true
      } as any
    });
    console.log('✅ hasSetPreferences field exists and works!');
    
    console.log('All tests passed! 🎉');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaModels();
