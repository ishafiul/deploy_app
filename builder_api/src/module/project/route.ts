import { HonoApp } from '../../type';
import getProjects from './handler/getProjects';
import getProject from './handler/getProject';
import { authMiddleware } from '../../middleware/auth';

export default function projectRoute(app: HonoApp) {
   getProject(app)
   getProjects(app)
}