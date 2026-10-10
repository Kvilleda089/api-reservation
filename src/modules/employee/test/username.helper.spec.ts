import { generateUsername } from "../common/helper/username.helper";

describe('generateUsername', () => {
  afterEach(() => jest.restoreAllMocks());

  it('usa las iniciales en mayúscula del nombre y apellido seguidas de 4 dígitos', () => {
    expect(generateUsername('kevin', 'villeda')).toMatch(/^KV\d{4}$/);
  });

  it('el número aleatorio mínimo es 1000', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(generateUsername('Ana', 'Pérez')).toBe('AP1000');
  });

  it('el número aleatorio máximo es 9999', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9999999);
    expect(generateUsername('Ana', 'Pérez')).toBe('AP9999');
  });

  it('siempre genera exactamente 6 caracteres para nombres normales', () => {
    for (let i = 0; i < 50; i++) {
      expect(generateUsername('Luis', 'Gómez')).toHaveLength(6);
    }
  });
});
