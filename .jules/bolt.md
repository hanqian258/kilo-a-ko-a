## 2024-05-22 - React.lazy Definition Placement
**Learning:** Defining `React.lazy` components inside the render function (or component body) causes them to be re-created on every re-render. This leads to the component unmounting and remounting, losing local state (like scroll position or form inputs) and causing visible flickering.
**Action:** Always define `const MyLazyComponent = React.lazy(...)` **outside** of the component function or export it from a separate module.
