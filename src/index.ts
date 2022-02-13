import styled from 'styled-components';

class StyledChain {
  public static definitions = {};

  public static register(name: string, style: React.CSSProperties) {
    StyledChain.definitions[name] = style;
  }
}

const getDefinitionProxy = (comp) => {
  return new Proxy(styled(comp), {
    get: function(obj, prop) {
      if (StyledChain.definitions[prop]) {
        // 把style继承下去
        return getDefinitionProxy(styled(comp)(StyledChain.definitions[prop]));
      }

      return obj(StyledChain.definitions[prop]);
    }
  });
};

const sc: any = new Proxy(styled, {
  get: function(obj, prop) {

    if (typeof(StyledChain[prop]) === 'function') {
      return StyledChain[prop];
    }

    const proxyTarget = styled[prop];

    return new Proxy(proxyTarget, {
      get: function(obj1, prop1) {
    
        if (StyledChain.definitions[prop1]) {
          return getDefinitionProxy(obj1(StyledChain.definitions[prop1]));
        }

        return obj1[prop1];
      }
    });
  }
});

type DefinitionType = {
  [ key in string ]: {
    (style: React.CSSProperties): any;
  } & DefinitionType
};

const exportSc: (
  {
    register: typeof StyledChain.register
  } & {
    // eslint-disable-next-line no-undef
    [ key in keyof (JSX.IntrinsicElements) ]: (typeof styled[key]) & DefinitionType
  }
) = sc;

export default exportSc;
