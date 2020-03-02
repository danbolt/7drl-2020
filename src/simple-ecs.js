const NewEntity = function () {
  return {};
};

const AddComponent = function (entity, componentName, data) {
  if (!entity) {
    throw new Error('entity was ' + JSON.stringify(entity) + ' instead of an object!');
  }

  if (!componentName) {
    throw new Error('component name was ' + JSON.stringify(entity) + ' instead of valid string!');
  }

  if (!data) {
    throw new Error('data was ' + JSON.stringify(entity) + ' instead of valid object!');
  }

  entity[componentName] = data;
  return entity[componentName];
};

const RemoveComponent = function(entity, componentName) {
  if (!HasComponent(entity, componentName)) {
    throw new Error('entity ' + JSON.stringify(entity) + ' did not have ' + componentName);
  }

  delete entity[componentName];
};

const HasComponent = function (entity, componentName) {
  return entity.hasOwnProperty(componentName);
}

const GetComponent = function (entity, componentName) {
  if (!HasComponent(entity, componentName)) {
    throw new Error('entity ' + JSON.stringify(entity) + ' did not have ' + componentName);
  }

  return entity[componentName];
};

const GetEntityComponents = function (entity, componentNames) {
  return componentNames.map((componentName) => { return GetComponent(entity, componentName); });
};

const HasAllComponents = function (entity, componentNames) {
  const results = componentNames.map((componentName) => { return HasComponent(entity, componentName); });
  const hasAllOfTheComponents = results.reduce((accum, hasComponent) => { return (accum && hasComponent); }, true);

  return hasAllOfTheComponents;
};

const HasNoneComponents = function (entity, componentNames) {
  const results = componentNames.map((componentName) => { return !(HasComponent(entity, componentName)); });
  const hasNoneOfTheComponents = results.reduce((accum, hasNotComponent) => { return (accum && hasNotComponent); }, true);

  return hasNoneOfTheComponents;
};

const RemoveComponentFromAllEntities = function (entities, componentName) {
  for (let i = 0; i < entities.length; i++) {
    const candidate = entities[i];
    if (candidate === undefined) {
      continue;
    }

    if (HasComponent(candidate, componentName)) {
      RemoveComponent(candidate, componentName);
    }
  }
};

const ViewEntities = function(entities, includeComponents, excludeComponents, viewFunction) {
  const ViewEntity = function (entity, shouldHaveComponents, viewFunction) {
    let argsToPush = [entity];
    argsToPush = argsToPush.concat(GetEntityComponents(entity, shouldHaveComponents));
    
    viewFunction.apply(this, argsToPush);
  };

  for (let i = 0; i < entities.length; i++) {
    const candidate = entities[i];
    if (candidate === undefined) {
      continue;
    }
    
    const hasAllIncludes = HasAllComponents(candidate, includeComponents);
    const hasNoExcludes = HasNoneComponents(candidate, excludeComponents);

    if (hasAllIncludes && hasNoExcludes) {
      ViewEntity(candidate, includeComponents, viewFunction);
    }
  }
};
