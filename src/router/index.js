import { createWebHistory, createRouter } from "vue-router";
import Home from "@/views/HomeView.vue";
import Apples from "@/views/AppleView.vue";
import Books from "@/views/BookView.vue";
import Expertise from "@/views/ExpertiseView.vue";
import Damage from "@/views/DamageView.vue";
import Moonphase from "@/views/MoonphaseView.vue";
import TimedDemons from "@/views/TimedDemonView.vue";
import DemonPlanner from "@/views/DemonPlannerView.vue";
import Fusion from "@/views/FusionView.vue";
import SkillList from "@/views/SkillListView.vue"

const DEFAULT_TITLE = 'Project New Moon Tools';
const routes = [
	{
		path: "/",
		name: "Home",
		component: Home,
		meta: { title: DEFAULT_TITLE }
	},
	{
		path: "/apples",
		name: "Apples",
		component: Apples,
		meta: { title: "Golden Apple Calculator" }
	},
	{
		path: "/books",
		name: "Books",
		component: Books,
		meta: { title: "Expertise Textbook Calculator" }
	},
	{
		path: "/damage",
		name: "Damage",
		component: Damage,
		meta: { title: "Damage Calculator" }
	},
	{
		path: "/expertise",
		name: "Expertise",
		component: Expertise,
		meta: { title: "Expertise Calculator" }
	},
	{
		path: "/moonphase",
		name: "Moonphase",
		component: Moonphase,
		meta: { title: "Moonphase Calculator" }
	},
	{
		path: "/timed-demons",
		name: "Timed Demons",
		component: TimedDemons,
		meta: { title: "Timed Demons Schedule" }
	},
	{
		path: "/demon-planner",
		name: "Demon Inheritance Planner",
		component: DemonPlanner,
		meta: { title: "Demon Inheritance Planner" }
	},
	{
		path: "/fusion",
		name: "Fusion Simulator",
		component: Fusion,
		meta: { title: "Fusion Simulator" }
	},
	{
		path: "/skill",
		name: "Skill List",
		component: SkillList,
		meta: { title: "Skill List" }
	}
];

const router = createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior(to, from, savedPosition) {
		if (to.hash) {
			return {
				el: to.hash,
				behavior: 'smooth',
			}
		}
	},
});

export default router;