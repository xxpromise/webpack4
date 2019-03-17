import mul from './module1';
import { add } from './module3';

import '../less/test1.less';
import '../less/test2.less';

const div = document.createElement('div');
div.innerHTML = `<span>${mul(2, 3)}</span> --- <span>${add(4, 5)}</span>`;
document.body.appendChild(div);

// 按需加载
async function getComponent() {
  const element = document.createElement('div');
  const module = await import(/* webpackChunkName: "module2" */ './module2');
  const Person = module.default;
  const { name, age } = new Person('jack', 18);
  element.innerHTML = `name: ${name}  age: ${age}`;
  return element;
}

document.getElementById('box1').onclick = () => {
  getComponent().then((component) => {
    document.body.appendChild(component);
  });
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('SW registered: ', registration);
    }).catch((registrationError) => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
