const fs = require('fs');
let content = fs.readFileSync('src/kernel/integration/QEOSKernel.ts', 'utf-8');

// The boot hooks expect certain types, we passed eventBus to them in our patch but we should use proper dummy implementations or correctly cast them as any.
content = content.replace("const configHook = new ConfigurationBootHook(this.configManager as any, [], eventBus);", "const configHook = new ConfigurationBootHook(this.configManager as any, [], { validate: () => {} } as any);");

content = content.replace("const pluginContext = {\n            container: this.container,\n            resolver: this.container,\n            eventBus: eventBus,\n            logger: loggerFactory\n        };", 
`const pluginContext = {
            container: this.container,
            resolver: this.container,
            eventBus: eventBus as any,
            logger: loggerFactory as any
        };`);

content = content.replace("const eventBusHook = new EventBusBootHook(eventBus as any);", "const eventBusHook = new EventBusBootHook(eventBus as any);");

content = content.replace("const containerHook = new ContainerBootHook(this.container, this.configManager as any, eventBus, loggerFactory as any);", "const containerHook = new ContainerBootHook(this.container, this.configManager as any, eventBus as any, loggerFactory as any);");

content = content.replace("this.pluginLoader = new PluginLoader(pluginRegistry, pluginValidator, pluginContext, eventBus);", "this.pluginLoader = new PluginLoader(pluginRegistry, pluginValidator, pluginContext as any, eventBus as any);");

content = content.replace("const securityHook = new SecurityBootHook(this.container, eventBus, loggerFactory as any, [], [], []);", "const securityHook = new SecurityBootHook(this.container, eventBus as any, loggerFactory as any, [], [], []);");

fs.writeFileSync('src/kernel/integration/QEOSKernel.ts', content);
