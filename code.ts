interface Color {
  rgb: {
    fraction: {
      r: number;
      g: number;
      b: number;
    };
  };
}
interface PluginParameters {
  'color-hex': string;
}

figma.on('run', async ({ command, parameters }: RunEvent) => {
  // Seed color determines the color scheme
  const seedColor = parameters?.['color-hex'];

  if (!seedColor) {
    console.error('No seed color provided');
    figma.closePlugin();
  }

  async function getColors(seedColor: string) {
    try {
      const response = await fetch(
        `https://www.thecolorapi.com/scheme?hex=${seedColor}`
      );
      return await response.json();
    } catch (error) {
      return error;
    }
  }

  async function setColorVariables(colorVariables: Color[]) {
    const localVariables = await figma.variables.getLocalVariablesAsync(
      'COLOR'
    );
    localVariables.forEach((variable: Variable, index) => {
      variable.setValueForMode('7:0', colorVariables[index].rgb.fraction);
    });
  }

  const colors = await getColors(seedColor);

  if (!colors.colors) {
    console.error('No colors found');
    figma.closePlugin();
  }

  await setColorVariables(colors.colors);
  figma.closePlugin();
});
