import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@casino.com' },
    update: {},
    create: {
      email: 'admin@casino.com',
      passwordHash,
      name: 'Administrateur',
      role: 'admin',
    },
  });
  console.log('✅ Admin créé:', admin.email);

  const employeHash = await bcrypt.hash('employe123', 10);
  const employe = await prisma.user.upsert({
    where: { email: 'employe@casino.com' },
    update: {},
    create: {
      email: 'employe@casino.com',
      passwordHash: employeHash,
      name: 'Employé Bar',
      role: 'employe',
    },
  });
  console.log('✅ Employé créé:', employe.email);

  const ingredients = [
    { name: 'Vodka', category: 'Alcool', subcategory: 'Spiritueux', isAlcoholic: true, baseSpirit: 'vodka' },
    { name: 'Gin', category: 'Alcool', subcategory: 'Spiritueux', isAlcoholic: true, baseSpirit: 'gin' },
    { name: 'Rhum blanc', category: 'Alcool', subcategory: 'Spiritueux', isAlcoholic: true, baseSpirit: 'rhum' },
    { name: 'Rhum ambré', category: 'Alcool', subcategory: 'Spiritueux', isAlcoholic: true, baseSpirit: 'rhum' },
    { name: 'Tequila', category: 'Alcool', subcategory: 'Spiritueux', isAlcoholic: true, baseSpirit: 'tequila' },
    { name: 'Whisky', category: 'Alcool', subcategory: 'Spiritueux', isAlcoholic: true, baseSpirit: 'whisky' },
    { name: 'Triple sec', category: 'Liqueur', subcategory: 'Orange', isAlcoholic: true, baseSpirit: null },
    { name: 'Cointreau', category: 'Liqueur', subcategory: 'Orange', isAlcoholic: true, baseSpirit: null },
    { name: 'Liqueur de café', category: 'Liqueur', subcategory: 'Café', isAlcoholic: true, baseSpirit: null },
    { name: 'Amaretto', category: 'Liqueur', subcategory: 'Amande', isAlcoholic: true, baseSpirit: null },
    { name: 'Jus de citron', category: 'Jus', subcategory: 'Agrume', isAlcoholic: false, baseSpirit: null },
    { name: 'Jus de citron vert', category: 'Jus', subcategory: 'Agrume', isAlcoholic: false, baseSpirit: null },
    { name: 'Jus d\'orange', category: 'Jus', subcategory: 'Agrume', isAlcoholic: false, baseSpirit: null },
    { name: 'Jus de cranberry', category: 'Jus', subcategory: 'Fruit', isAlcoholic: false, baseSpirit: null },
    { name: 'Jus d\'ananas', category: 'Jus', subcategory: 'Fruit', isAlcoholic: false, baseSpirit: null },
    { name: 'Sirop de sucre', category: 'Sirop', subcategory: null, isAlcoholic: false, baseSpirit: null },
    { name: 'Sirop de grenadine', category: 'Sirop', subcategory: null, isAlcoholic: false, baseSpirit: null },
    { name: 'Tonic', category: 'Soft', subcategory: 'Gazeux', isAlcoholic: false, baseSpirit: null },
    { name: 'Coca-Cola', category: 'Soft', subcategory: 'Gazeux', isAlcoholic: false, baseSpirit: null },
    { name: 'Eau gazeuse', category: 'Soft', subcategory: 'Gazeux', isAlcoholic: false, baseSpirit: null },
    { name: 'Menthe fraîche', category: 'Garniture', subcategory: 'Herbe', isAlcoholic: false, baseSpirit: null },
    { name: 'Citron', category: 'Garniture', subcategory: 'Agrume', isAlcoholic: false, baseSpirit: null },
    { name: 'Citron vert', category: 'Garniture', subcategory: 'Agrume', isAlcoholic: false, baseSpirit: null },
    { name: 'Orange', category: 'Garniture', subcategory: 'Agrume', isAlcoholic: false, baseSpirit: null },
    { name: 'Angostura bitter', category: 'Bitter', subcategory: null, isAlcoholic: true, baseSpirit: null },
  ];

  for (const ing of ingredients) {
    const created = await prisma.ingredient.upsert({
      where: { name: ing.name },
      update: {},
      create: ing,
    });
    await prisma.barAvailability.upsert({
      where: { ingredientId: created.id },
      update: {},
      create: {
        ingredientId: created.id,
        available: false,
      },
    });
  }
  console.log(`✅ ${ingredients.length} ingrédients créés`);

  const ingredientsMap: Record<string, string> = {};
  const allIngredients = await prisma.ingredient.findMany();
  allIngredients.forEach(ing => {
    ingredientsMap[ing.name] = ing.id;
  });

  const cocktails = [
    {
      name: 'Mojito',
      description: 'Cocktail cubain rafraîchissant à base de rhum blanc, menthe fraîche et citron vert',
      type: 'Long drink',
      baseSpirit: 'rhum',
      glass: 'Highball',
      ice: true,
      iceType: 'Cubes',
      method: 'Au pilon, directement dans le verre',
      garnish: 'Menthe fraîche, citron vert',
      imageUrl: null,
      ingredients: [
        { name: 'Rhum blanc', quantity: 5, unit: 'cl', isOptional: false },
        { name: 'Jus de citron vert', quantity: 3, unit: 'cl', isOptional: false },
        { name: 'Sirop de sucre', quantity: 2, unit: 'cl', isOptional: false },
        { name: 'Menthe fraîche', quantity: 10, unit: 'feuilles', isOptional: false },
        { name: 'Eau gazeuse', quantity: 10, unit: 'cl', isOptional: false },
        { name: 'Citron vert', quantity: 1, unit: 'tranche', isOptional: false },
      ],
    },
    {
      name: 'Margarita',
      description: 'Cocktail mexicain classique à base de tequila et de citron vert',
      type: 'Short drink',
      baseSpirit: 'tequila',
      glass: 'Coupe à margarita',
      ice: true,
      iceType: 'Cubes',
      method: 'Au shaker avec glace',
      garnish: 'Sel sur le bord, citron vert',
      imageUrl: null,
      ingredients: [
        { name: 'Tequila', quantity: 5, unit: 'cl', isOptional: false },
        { name: 'Triple sec', quantity: 2, unit: 'cl', isOptional: false },
        { name: 'Jus de citron vert', quantity: 3, unit: 'cl', isOptional: false },
        { name: 'Citron vert', quantity: 1, unit: 'tranche', isOptional: false },
      ],
    },
    {
      name: 'Cosmopolitan',
      description: 'Cocktail élégant à base de vodka et cranberry',
      type: 'Short drink',
      baseSpirit: 'vodka',
      glass: 'Verre à cocktail',
      ice: false,
      iceType: null,
      method: 'Au shaker avec glace, servir sans glace',
      garnish: 'Zeste d\'orange',
      imageUrl: null,
      ingredients: [
        { name: 'Vodka', quantity: 4, unit: 'cl', isOptional: false },
        { name: 'Triple sec', quantity: 1.5, unit: 'cl', isOptional: false },
        { name: 'Jus de citron vert', quantity: 1.5, unit: 'cl', isOptional: false },
        { name: 'Jus de cranberry', quantity: 3, unit: 'cl', isOptional: false },
        { name: 'Orange', quantity: 1, unit: 'zeste', isOptional: false },
      ],
    },
    {
      name: 'Gin Tonic',
      description: 'Classique britannique simple et rafraîchissant',
      type: 'Long drink',
      baseSpirit: 'gin',
      glass: 'Highball',
      ice: true,
      iceType: 'Cubes',
      method: 'Directement au verre',
      garnish: 'Citron ou concombre',
      imageUrl: null,
      ingredients: [
        { name: 'Gin', quantity: 5, unit: 'cl', isOptional: false },
        { name: 'Tonic', quantity: 15, unit: 'cl', isOptional: false },
        { name: 'Citron', quantity: 1, unit: 'tranche', isOptional: true },
      ],
    },
    {
      name: 'Piña Colada',
      description: 'Cocktail tropical crémeux à base de rhum et ananas',
      type: 'Long drink',
      baseSpirit: 'rhum',
      glass: 'Verre hurricane',
      ice: true,
      iceType: 'Pilé',
      method: 'Au blender avec glace pilée',
      garnish: 'Ananas, cerise',
      imageUrl: null,
      ingredients: [
        { name: 'Rhum blanc', quantity: 6, unit: 'cl', isOptional: false },
        { name: 'Jus d\'ananas', quantity: 9, unit: 'cl', isOptional: false },
      ],
    },
    {
      name: 'Mai Tai',
      description: 'Cocktail tiki complexe avec deux types de rhum',
      type: 'Long drink',
      baseSpirit: 'rhum',
      glass: 'Old fashioned',
      ice: true,
      iceType: 'Pilé',
      method: 'Au shaker puis au verre',
      garnish: 'Menthe, citron vert',
      imageUrl: null,
      ingredients: [
        { name: 'Rhum blanc', quantity: 3, unit: 'cl', isOptional: false },
        { name: 'Rhum ambré', quantity: 3, unit: 'cl', isOptional: false },
        { name: 'Triple sec', quantity: 1.5, unit: 'cl', isOptional: false },
        { name: 'Jus de citron vert', quantity: 2, unit: 'cl', isOptional: false },
        { name: 'Sirop de sucre', quantity: 1, unit: 'cl', isOptional: false },
        { name: 'Menthe fraîche', quantity: 3, unit: 'feuilles', isOptional: false },
      ],
    },
    {
      name: 'Moscow Mule',
      description: 'Cocktail rafraîchissant à la vodka et ginger beer',
      type: 'Long drink',
      baseSpirit: 'vodka',
      glass: 'Mug en cuivre',
      ice: true,
      iceType: 'Cubes',
      method: 'Directement au verre',
      garnish: 'Citron vert, menthe',
      imageUrl: null,
      ingredients: [
        { name: 'Vodka', quantity: 5, unit: 'cl', isOptional: false },
        { name: 'Jus de citron vert', quantity: 1.5, unit: 'cl', isOptional: false },
        { name: 'Citron vert', quantity: 1, unit: 'tranche', isOptional: false },
      ],
    },
    {
      name: 'Screwdriver',
      description: 'Simple et efficace : vodka et jus d\'orange',
      type: 'Long drink',
      baseSpirit: 'vodka',
      glass: 'Highball',
      ice: true,
      iceType: 'Cubes',
      method: 'Directement au verre',
      garnish: 'Orange',
      imageUrl: null,
      ingredients: [
        { name: 'Vodka', quantity: 5, unit: 'cl', isOptional: false },
        { name: 'Jus d\'orange', quantity: 15, unit: 'cl', isOptional: false },
        { name: 'Orange', quantity: 1, unit: 'tranche', isOptional: true },
      ],
    },
    {
      name: 'Tequila Sunrise',
      description: 'Cocktail spectaculaire avec dégradé de couleurs',
      type: 'Long drink',
      baseSpirit: 'tequila',
      glass: 'Highball',
      ice: true,
      iceType: 'Cubes',
      method: 'Directement au verre, grenadine en dernier',
      garnish: 'Orange, cerise',
      imageUrl: null,
      ingredients: [
        { name: 'Tequila', quantity: 4.5, unit: 'cl', isOptional: false },
        { name: 'Jus d\'orange', quantity: 9, unit: 'cl', isOptional: false },
        { name: 'Sirop de grenadine', quantity: 1.5, unit: 'cl', isOptional: false },
        { name: 'Orange', quantity: 1, unit: 'tranche', isOptional: true },
      ],
    },
    {
      name: 'White Russian',
      description: 'Cocktail crémeux à base de vodka et liqueur de café',
      type: 'Short drink',
      baseSpirit: 'vodka',
      glass: 'Old fashioned',
      ice: true,
      iceType: 'Cubes',
      method: 'Directement au verre',
      garnish: null,
      imageUrl: null,
      ingredients: [
        { name: 'Vodka', quantity: 5, unit: 'cl', isOptional: false },
        { name: 'Liqueur de café', quantity: 2, unit: 'cl', isOptional: false },
      ],
    },
  ];

  for (const cocktail of cocktails) {
    const { ingredients: cocktailIngredients, ...cocktailData } = cocktail;

    const createdCocktail = await prisma.cocktail.upsert({
      where: { id: 'temp-' + cocktail.name },
      update: {},
      create: cocktailData,
    }).catch(async () => {
      return await prisma.cocktail.create({
        data: cocktailData,
      });
    });

    for (const ing of cocktailIngredients) {
      const ingredientId = ingredientsMap[ing.name];
      if (ingredientId) {
        await prisma.cocktailIngredient.create({
          data: {
            cocktailId: createdCocktail.id,
            ingredientId: ingredientId,
            quantity: ing.quantity,
            unit: ing.unit,
            isOptional: ing.isOptional,
          },
        });
      }
    }
  }
  console.log(`✅ ${cocktails.length} cocktails créés`);

  console.log('🎉 Seed terminé avec succès!');
  console.log('📧 Admin: admin@casino.com / admin123');
  console.log('📧 Employé: employe@casino.com / employe123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
